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
	"golang.org/x/crypto/bcrypt"
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
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var user models.User
		if err := c.BindJSON(&user); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := validate.Struct(user); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// checking if email already exists
		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error checking for email"})
			return
		}
		if count > 0{
			c.JSON(http.StatusBadRequest, gin.H{"error": "email already exists"})
			return
		}

		password, err:= bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}

		user.Password = string(password)
		user.Created_at = time.Now()
		user.Updated_at = time.Now()
		user.ID = primitive.NewObjectID()
		user.User_id = user.ID.Hex()

		if user.Role == ""{
			user.Role = "USER"
		}

		_, err = userCollection.InsertOne(ctx, user)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
			return
		}

		user.Password = ""

		c.JSON(http.StatusCreated, user)
	}
}

func Login() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var user models.User
		var userFound models.User

		if err:= c.BindJSON(&user); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// look for user by Email
		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&userFound)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
			return
		}

		// verify the password, input: (hashed_password, password)
		err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
			return
		}

		token, refreshToken, err := auth.GenerateAllToken(
			userFound.Email,
			userFound.First_name,
			userFound.Last_name,
			userFound.User_id,
			userFound.Role,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate tokens"})
			return
		}

		update := bson.M{
			"token": token,
			"refresh_token": refreshToken,
			"updated_at": time.Now(),
		}

		_, err = userCollection.UpdateOne(
			ctx,
			bson.M{"user_id": foundUser.user_id},
			bson.M{"$set": update},
		)

		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user tokens"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"refresh_token": refreshToken,
			"user_id": userFound.User_id,
			"role": userFound.Role,
		})
	}
}