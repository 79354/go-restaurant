package controllers

import (
	"context"
	"go-restaurant/database"
	"go-restaurant/models"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var	foodCollection *mongo.Collection = database.FoodCollection


func GetFoods() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil || recordPerPage < 1 {
			recordPerPage = 10
		}

		page, err := strconv.Atoi(c.Query("page"))
		if err != nil || page < 1 {
			page = 1
		}

		startIndex := (page - 1) * recordPerPage
		// Override startIndex if provided
		if startIndexStr := c.Query("startIndex"); startIndexStr != "" {
			if idx, err := strconv.Atoi(startIndexStr); err == nil && idx >= 0 {
				startIndex = idx
			}
		}

		matchStage := bson.D{{Key: "$match", Value: bson.D{}}}
		groupStage := bson.D{
			{Key: "$group", Value: bson.D{
				{Key: "_id", Value: nil},
				{Key: "total_count", Value: bson.D{{Key: "$sum", Value: 1}}},
				{Key: "data", Value: bson.D{{Key: "$push", Value: "$$ROOT"}}},
			}},
		}
		projectStage := bson.D{
			{Key: "$project", Value: bson.D{
				{Key: "_id", Value: 0},
				{Key: "total_count", Value: 1},
				{Key: "food_items", Value: bson.D{
					{Key: "$slice", Value: []interface{}{"$data", startIndex, recordPerPage}},
				}},
			}},
		}

		// Perform aggregation
		result, err := foodCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage,
			groupStage,
			projectStage,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to execute aggregation", "details": err.Error()})
			return
		}
		defer result.Close(ctx)

		var allFoods []bson.M
		if err = result.All(ctx, &allFoods); err != nil { 
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results", "details": err.Error()})
			return
		}

		if len(allFoods) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"total_count": 0,
				"food_items":  []models.Food{},
			})
			return
		}

		c.JSON(http.StatusOK, allFoods[0]) // result.All returns array of docs; we get first (only) group
	}
}

func GetFood() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		foodId := c.Param("food_id")
		if foodId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Food ID is required"})
			return
		}

		var food models.Food
		err := foodCollection.FindOne(ctx, bson.M{"food_id" : foodId}).Decode(&food)
		if err != nil{
			if err == mongo.ErrNoDocuments{
				c.JSON(http.StatusNotFound, gin.H{"error": "Food item not found"})
			}else{
				c.JSON(http.StatusInternalServerError, gin.H{"error": "error retrieving food item", "details": err.Error()})
			}
			return
		}
		c.JSON(http.StatusOK, food)
	}
}

func CreateFood() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var food models.Food

		if err := c.BindJSON(&food); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(food)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		var menu models.Menu
		err := menuCollection.FindOne(ctx, bson.M{"menu_id": food.Menu_id}).Decode(&menu)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found", "menu_id": *food.Menu_id})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
			}
			return
		}

		// Set timestamps
		now := time.Now()
		food.Created_at = now
		food.Updated_at = now

		// Generate ID
		food.ID = primitive.NewObjectID()
		food.Food_id = food.ID.Hex()

		// Set default available if nil
		if food.Available == nil {
			food.Available = BoolPtr(true)
		}

		// Round price if provided
		if food.Price != nil {
			roundedPrice := toFixed(*food.Price, 2)
			food.Price = &roundedPrice
		}

		result, insertErr := foodCollection.InsertOne(ctx, food)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create food item", "details": insertErr.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Food item created successfully",
			"food_id": food.Food_id,
			"result":  result,
		})
	}
}

// rounds to nearest whole number
func round(num float64) int{
	return int(num + math.Copysign(0.5, num))
}

// eg: num = 3.14159, precision = 2 --> retruns 3.14, upto two decimal places
func toFixed(num float64, precision int) float64{
	output := math.Pow(10, float64(precision))	
	return float64(round(num*output)) / output
}

func BoolPtr(b bool) *bool { return &b }
func StringPtr(s string) *string { return &s }
func Float64Ptr(f float64) *float64 { return &f }

func UpdateFood() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var food models.Food

		foodId := c.Param("food_id")
		if foodId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Food ID is required"})
			return
		}

		if err := c.BindJSON(&food); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
			return
		}

		var updateObj primitive.D

		if food.Name != nil {
			updateObj = append(updateObj, bson.E{Key: "name", Value: *food.Name})
		}

		if food.Price != nil {
			rounded := toFixed(*food.Price, 2)
			updateObj = append(updateObj, bson.E{Key: "price", Value: rounded})
		}

		if food.Category_id != nil {
			updateObj = append(updateObj, bson.E{Key: "category_id", Value: *food.Category_id})
		}

		if food.Description != nil {
			updateObj = append(updateObj, bson.E{Key: "description", Value: *food.Description})
		}

		if food.Menu_id != nil {
			var menu models.Menu
			err := menuCollection.FindOne(ctx, bson.M{"menu_id": food.Menu_id}).Decode(&menu)
			if err != nil {
				if err == mongo.ErrNoDocuments {
					c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found", "menu_id": *food.Menu_id})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
				}
				return
			}
			updateObj = append(updateObj, bson.E{Key: "menu_id", Value: *food.Menu_id})
		}

		if food.Image != nil {
			updateObj = append(updateObj, bson.E{Key: "image", Value: *food.Image})
		}

		if food.Available != nil {
			updateObj = append(updateObj, bson.E{Key: "available", Value: *food.Available})
		}

		// Always update updated_at
		updateObj = append(updateObj, bson.E{Key: "updated_at", Value: time.Now()})

		upsert := true
		opt := options.UpdateOptions{
			Upsert: &upsert,
		}

		result, err := foodCollection.UpdateOne(
			ctx,
			bson.M{"food_id": foodId},
			bson.D{{Key: "$set", Value: updateObj}},
			&opt,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food item", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Food updated successfully",
			"matched": result.MatchedCount,
			"modified": result.ModifiedCount,
		})
	}
}

func DeleteFood() gin.HandlerFunc{
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		foodID := c.Param("food_id")
		if foodID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Food ID is required"})
			return
		}

		result, err := foodCollection.DeleteOne(ctx, bson.M{"food_id": foodID})
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Food item", "details": err.Error()})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Food item not found"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

/*
	GET /path?id=1234&name=Manu&value=
	c.Query("id") == "1234"
	c.Query("name") == "Manu"
*/