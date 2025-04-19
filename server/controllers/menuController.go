package controllers

import (
	"context"
	"go-restaurant/database"
	"go-restaurant/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var menuCollection *mongo.Collection = database.OpenCollection(database.Client, "menu")

func GetMenus() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := menuCollection.Find(ctx, bson.M{})
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error while listing the menu items"})
			return
		}

		var allMenus []bson.M
		if err = result.All(ctx, &allMenus); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error while decoding menu items"})
			return
		}
		c.JSON(http.StatusOK, allMenus)
	}
}

func GetMenu() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		menuId := c.Param("menu_id")
		var menu models.Menu

		err := menuCollection.FindOne(ctx, bson.M{"menu_id": menuId}).Decode(&menu)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "menu not found"})
			return
		}
		c.JSON(http.StatusOK, menu)
	}
}

func CreateMenu() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var menu models.Menu
		if err := c.BindJSON(&menu); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if menu.Start_time != nil && menu.End_time != nil {
			if !isValidTimeSpan(*menu.Start_time, *menu.End_time) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid time span: start time must be before end time and in the future"})
				return
			}
		}

		if !menu.Active {
			menu.Active = true
		}

		if validationErr := validate.Struct(menu); validationErr != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		menu.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		menu.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		menu.ID = primitive.NewObjectID()
		menu.Menu_id = menu.ID.Hex()

		result, insertErr := menuCollection.InsertOne(ctx, menu)
		if insertErr != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Menu was not created"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "menu created successfully",
			"menu_id": menu.ID,
			"result": result,
		})
	}
}

func isValidTimeSpan(start, end time.Time) bool{
	return start.Before(end) && start.After(time.Now())
}

func UpdateMenu() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var menu models.Menu

		if err := c.BindJSON(&menu); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		menuId := c.Param("menu_id")
		filter := bson.M{"menu_id": menuId}

		if menu.Start_time != nil && menu.End_time != nil{
			if !isValidTimeSpan(*menu.Start_time, *menu.End_time) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "kindly enter the time again"})
				return
			}
			updateObj = append(updateObj, bson.E{Key: "start_time", Value: menu.Start_time})
			updateObj = append(updateObj, bson.E{Key: "end_time", Value: menu.End_time})

			if menu.Name != ""{
				updateObj = append(updateObj, bson.E{"name", menu.Name})
			}

			if menu.Category != ""{
				updateObj = append(updateObj, bson.E{"category", menu.Category})
			}

			updateObj = append(updateObj, bson.E{Key: "active", Value: menu.Active})

			menu.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
			updateObj = append(updateObj, bson.E{"updated_at", menu.Updated_at})

			opts := options.Update().SetUpsert(true)

			result, err := menuCollection.UpdateOne(
				ctx,
				filter,
				bson.D{{Key: "$set", Value: updateObj}},
				opts,
			)
			if err != nil{
				c.JSON(http.StatusInternalServerError, gin.H{"error": "menu update failed"})
				return
			}

			if result.MatchedCount == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "menu not found"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "menu updated successfully",
				"modified_count": result.ModifiedCount,
				"result": result,
			})
		}
	}
}

func DeleteMenu() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		menuID := c.Param("menu_id")

		// Check if menu exists before attempting to delete
		var menu models.Menu
		err := menuCollection.FindOne(ctx, bson.M{"menu_id": menuID}).Decode(&menu)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "menu not found"})
			return
		}

		// Delete the menu
		result, err := menuCollection.DeleteOne(ctx, bson.M{"menu_id": menuID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "menu deletion failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "menu deleted successfully",
			"deleted_count": result.DeletedCount,
		})
	}
}

/*
// GetActiveMenus returns all currently active menus
func GetActiveMenus() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Find menus that are active and within their time span
		now := time.Now()
		filter := bson.M{
			"active": true,
			"$or": bson.A{
				bson.M{
					"start_time": bson.M{"$lte": now},
					"end_time": bson.M{"$gte": now},
				},
				bson.M{
					"start_time": bson.M{"$exists": false},
				},
			},
		}

		result, err := menuCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error retrieving active menus"})
			return
		}

		var activeMenus []bson.M
		if err = result.All(ctx, &activeMenus); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding active menus"})
			return
		}

		c.JSON(http.StatusOK, activeMenus)
	}
}
*/