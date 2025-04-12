package controllers

import (
	"go-restaurant/models"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var tableCollection *mongo.Collection = database.OpenCollection(database.Client, "table")

func GetTables() gin.HandlerFunc{
	return func(c *gin.Context{
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		result, err := orderCollection.Find(ctx, bson.M{})
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing table items"})
			return
		}

		var allTables []bson.M
		if err := result.All(&allTables); err != nil{
			return
		}
		c.JSON(http.StatusOK, allTables)
	}
}

func GetTable() gin.HandlerFunc{
	return func(c *gin.Context{
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		tableId := c.Param("table_id")
		var table models.Table

		err := tableCollection.FindOne(ctx, bson.M{"table_id", tableId}).Decode(&table)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching the table"})
			return
		}
		c.JSON(http.StatusOK, table)
	}
}

func CreateTable() gin.HandlerFunc{
	return func(c *gin.Context{
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var table models.Table

		if err := c.BindJSON(&table); err != nil{
			cc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(table)
		if validationErr != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}
		
		table.ID = primitive.NewObjectID()
		table.Table_id = table.ID.Hex()

		table.Created_at, _ = time.Parse(RFC3339, time.Now().Format(time.RFC3339))
		table.Updated_at, _ = time.Parse(RFC3339, time.Now().Format(time.RFC3339))

		result, err := tableCollection.InsertOne(ctx, table)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Table item was not created"})
			return
		}
		c.JSON(http.StatusCreated, result)
	}
}

func UpdateTable() gin.HandlerFunc{
	return func(c *gin.Context{
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var table models.Table
		if err := c.BindJSON(&table); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		var updateObj primitive.D
		
		if table.Table_Number != nil{
			updateObj = append(updateObj, bson.E{"table_number": table.Table_Number})
		}

		if table.Capacity != nil{
			updateObj = append(updateObj, bson.E{"capacity": table.Capacity})
		}

		if table.Status != nil{
			updateObj = append(updateObj, bson.E{"status": table.Status})
		}

		tableId := c.Param("table_id")
		filter := bson.M{"table_id": tableId}

		upsert := true
		opt := options.UpdateOptions{
			Upsert: &upsert,
		}

		result, err := tableCollection.UpdateOne(
			ctx,
			filter,
			bson.D{
				{"$set", updateObj},
			}
			&opt,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "table item update failed"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
