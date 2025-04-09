package controllers

import (
	"context"
	"go-restaurant/database"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var invoiceCollection *mongo.Collection = database.OpenConnection(database.Client, "invoice")

func GetInvoice() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := 
	}
}

func GetInvoices() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := invoiceCollection.Find(ctx, bson.M{})
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing invoice items"})
		}

		var allInvoices []bson.M
		if err = result.All(ctx, &allInvoices); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing invoice items"})
		}

	}
}