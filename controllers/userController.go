package controllers

import (
	"context"
	"go-restaurant/database"
	"go-restaurant/models"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/mgo.v2/bson"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")

func GetUsers() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
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

		matchStage := bson.D{{"$match", bson.D{{}}}}
		projectStage := bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"total_count", 1},
				{"user_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
			}}
		}

		result, err := userCollection.Aggregate(ctx, mongo.Pipeline{matchStage, projectStage})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occured while listing user items"})
		}

		var allUsers []bson.M
		if err := result.All(&allUsers); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode foods", "details": err.Error()})
			return
		}

		if len(allUsers) == 0{
			c.JSON(http.StatusInternalServerError, gin.H{"total_count": 0, "user_items": []models.User})
			return
		}
	
		c.BindJSON(http.StatusOK, allUsers[0])
	}
}

func GetUser() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		userId := c.Param("user_id")
		var user models.User

		err := userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occured while listing user items"})
		}
		c.JSON(http.StatusOK, user)
	}
}

func Signup() gin.HandlerFunc{
	return func(c *gin.Context){

	}
}

func Login() gin.HandlerFunc{
	return func(c *gin.Context){

	}
}

func HashPassword(){

}

func VerifyPass(){

}