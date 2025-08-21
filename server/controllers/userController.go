// userController.go
package controllers

import (
    "context"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"

    "go-restaurant/database"
    "go-restaurant/helpers"
    "go-restaurant/models"
)

var userCollection *mongo.Collection = database.UserCollection

func GetUsers() gin.HandlerFunc {
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
                {Key: "user_items", Value: bson.D{
                    {Key: "$slice", Value: []interface{}{"$data", startIndex, recordPerPage}},
                }},
            }},
        }

        pipeline := mongo.Pipeline{matchStage, groupStage, projectStage}
        result, err := userCollection.Aggregate(ctx, pipeline)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing users"})
            return
        }
        defer result.Close(ctx)

        var allUsers []bson.M
        if err = result.All(ctx, &allUsers); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users", "details": err.Error()})
            return
        }

        if len(allUsers) == 0 {
            c.JSON(http.StatusOK, gin.H{
                "total_count": 0,
                "user_items":  []models.User{},
            })
            return
        }

        c.JSON(http.StatusOK, allUsers[0])
    }
}

func GetUser() gin.HandlerFunc {
    return func(c *gin.Context) {
        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()

        userId := c.Param("user_id")
        var user models.User

        err := userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
        if err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        user.Password = "" // don't send password
        c.JSON(http.StatusOK, user)
    }
}

// Signup handles user registration
func Signup() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User

		// Bind JSON data
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request data",
				"details": err.Error(),
			})
			return
		}

		// Validate user data
		validationErr := validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Validation failed",
				"details": validationErr.Error(),
			})
			return
		}

		// Check if user already exists
		var existingUser models.User
		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": "User with this email already exists",
			})
			return
		}

		// Hash password
		password := helpers.HashPassword(user.Password)
		user.Password = password

		// Set default role if not provided
		if user.Role == "" {
			defaultRole := "staff"
			user.Role = defaultRole
		}

		// Set timestamps
		user.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.ID = primitive.NewObjectID()
		user.User_id = user.ID.Hex()

		// Insert user into database
		result, insertErr := userCollection.InsertOne(ctx, user)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create user",
				"details": insertErr.Error(),
			})
			return
		}

		// Return success response
		c.JSON(http.StatusCreated, gin.H{
			"message": "User created successfully",
			"user_id": user.User_id,
			"result":  result,
		})
	}
}

// Login handles user authentication
func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User
		var foundUser models.User

		// Bind JSON data
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request data",
				"details": err.Error(),
			})
			return
		}

		// Find user by email
		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid email or password",
			})
			return
		}

		// Validate password
		passwordIsValid, msg := helpers.VerifyPassword(user.Password, foundUser.Password)
		if !passwordIsValid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": msg,
			})
			return
		}

		// Generate token
		token, refreshToken, _ := helpers.GenerateAllToken(
			foundUser.Email,
			foundUser.First_name,
			foundUser.Last_name,
			foundUser.User_id,
			foundUser.Role,
		)
		helpers.UpdateAllTokens(token, refreshToken, foundUser.User_id)

		// Return success response
		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"user":    foundUser,
			"token":   token,
			"refresh_token": refreshToken,
		})
	}
}
