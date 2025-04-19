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
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var(
	foodCollection *mongo.Collection = database.OpenCollection(database.Client, "food")
	validate = validator.New()
)

func GetFoods() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil && recordPerPage < 1{
			recordPerPage = 10
		}

		page, err := strconv.Atoi(c.Query("page"))
		if err != nil && page < 1{
			page = 1
		}

		startIndex := -1
		startIndex, err = strconv.Atoi(c.Query("startIndex"))
		if err != nil && startIndex < 0 {
			startIndex = (page - 1) * recordPerPage
		}

		matchStage := bson.D{{"$match", bson.D{}}}
		groupStage := bson.D{
			{"$group", bson.D{
				{"_id", bson.D{{"_id", "null"}}}, 
				{"total_count", bson.D{{"$sum", 1}}}, 
				{"data", bson.D{{"$push", "$$ROOT"}}},
			}},
		}
		projectStage := bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"total_count", 1},
				{"food_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
			}}
		}

		result, err := foodCollection.Aggregate(ctx,
			mongo.Pipeline{
				matchStage,
				groupStage,
				projectStage,
			},
		)
		var allFoods []bson.M
		if err := result.All(&allFoods); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode foods", "details": err.Error()})
			return
		}

		if len(allFoods) == 0{
			c.JSON(http.StatusInternalServerError, gin.H{"total_count": 0, "food_items": []models.Food})
			return
		}

		c.JSON(http.StatusOK, allFoods[0])
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

func CreateFood() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		var food models.Food
		
		if err := c.BindJSON(&food); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		validationErr := validate.Struct(food)
		if validationErr != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}
		
		var menu models.Menu

		err := menuCollection.FindOne(ctx, bson.M{"menu_id": food.Menu_id}).Decode(&menu)
		if err != nil{
			msg := "menu was not found"
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			return
		}

		validationErr = validate.Struct(menu)
		if validationErr != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		food.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		food.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		food.ID := primitive.NewObjectID()
		food.Food_id := food.ID.Hex()

		if !food.Available {
			food.Available = true
		}

		food.Price = toFixed(food.Price, 2)

		result, insertErr := foodCollection.InsertOne(ctx, food)
		if insertErr != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to Create the Food item", "details": insertErr.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{
			"message": "Food item created successfully",
			"food_id": food.Food_id,
			"result": result,
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

func UpdateFood() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var menu models.Menu
		var food models.Food

		foodId := c.Param("food_id")
		if foodId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Food ID is required"})
			return
		}

		if err := c.BindJSON(&food); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
			return
		}

		var updateObj primitive.D
		
		if food.Name != nil{
			updateObj = append(updateObj, bson.E{"name", food.Name})
		}

		if food.Price != nil{
			updateObj = append(updateObj, bson.E{"price", food.Price})
		}

		if food.Category_id != nil{
			updateObj = append(updateObj, bson.E{"category_id", food.Category_id})
		}
		
		if food.Description != nil{
			updateObj = append(updateObj, bson.E{"description", food.Description})
		}
		
		if food.Menu_id != nil{
			err := menuCollection.FindOne(ctx, bson.M{"menu_id": food.Menu_id}).Decode(&menu)
			defer cancel()
			if err != nil{
				if err == mongo.ErrNoDocuments {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Menu not found", "menu_id": *food.Menu_id})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
				}
				return
			}
			updateObj = append(updateObj, bson.E{"menu_id", food.Menu_id})
		}

		if food.Image != nil {
			updateObj = append(updateObj, bson.E{"image", *food.Image})
		}

		if food.Available != nil {
			updateObj = append(updateObj, bson.E{"available", *food.Available})
		}

		food.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		updateObj = append(updateObj, bson.E{"updated_at", food.Updated_at})

		upsert := true
		opt := options.UpdateOptions{
			Upsert: &upsert,
		}

		result, err := foodCollection.UpdateOne(
			ctx,
			bson.M{"food_id": foodId},
			bson.D{{"$set", updateObj}},
			&opt,
		)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food item", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
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