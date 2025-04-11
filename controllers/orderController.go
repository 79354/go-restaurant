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

var orderCollection *mongo.Collection = database.OpenCollection(database.Client, "order")
var tableCollection *mongo.Collection = database.OpenCollection(database.Client, "table")

func GetOrders() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := orderCollection.Find(ctx, bson.M{})
		if err != nil{
			c.JSON(http.StatusInternalServerError ,gin.H{"error": "error occurred while listing order items"})
		}

		var allOrders []bson.M
		if err = result.All(ctx, &allOrders); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders", "details": err.Error()})
			return
		}
		c.JSON(http.StatusOK, allOrders)
	}
}

func GetOrder() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		orderID := c.Param("order_id")
		var order models.Order

		_, err := orderCollection.FindOne(ctx, bson.M{"order_id": orderID}).Decode(&order)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching the order item"})
		}
		c.JSON(http.StatusOK, order)
	}
}

func CreateOrder() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var order models.Order
		if err := c.BindJSON(&order); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// validate required fields
		if order.Table_id == nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": "table_id is required"})
			return
		}

		// check if table exists
		var table models.Table
		err := tableCollection.FindOne(ctx, bson.M{"table_id": order.Table_id}).Decode(&table)
		if err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": "table not found"})
			return
		}

		// Set order dates
		order.Order_date, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

		// create the order
		orderID := OrderItemOrderCreator(order)
		c.JSON(http.StatusOK, gin.H{"message": "Order created successfully", "order_id": orderID})
	}
}

func UpdateOrder() gin.HandlerFunc{
	return func(c *gin.Context){
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var order models.Order
		orderID := c.Param("order_id")
		
		if err := c.BindJSON(&order); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		
		if order.Table_id != nil {
			var table models.Table

			err := tableCollection.FindOne(ctx, bson.M{"table_id": order.Table_id}).Decode(&table)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "table not found"})
				return
			}
		}

		// create update fields
		updateObj := bson.M{}

		if order.Table_id != nil{
			updateObj["table_id"] = order.Table_id
		}

		if order.Payment_method != nil{
			updateObj["payment_method"] = order.Payment_method
		}

		updateObj["updated_at"], _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

		if order.Status != nil{
			updateObj["status"] = order.Status
		}

		filter := bson.M{"order_id": orderID}
		update := bson.M{"$set": updateObj}

		result, err := orderCollection.UpdateOne(
			ctx,
			filter,
			update,
		)

		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while updating the object"})
			return
		}

		if result.MatchedCount == 0{
			c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order updated successfully"})
	}
}

func OrderItemOrderCreator(order models.Order) string {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	order.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	order.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	order.ID = primitive.NewObjectID()
	order.Order_id = order.ID.Hex()

	_, err := orderCollection.InsertOne(ctx, order)
	if err != nil {
		return ""
	}
	return order.Order_id
}

/*
func DeleteOrder() gin.HandlerFunc{
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		orderId := c.Param("order_id")

		result, err := orderCollection.DeleteOne(ctx, bson.M{"order_id": orderId})
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while deleting the order"})
			return
		}

		if result.DeletedCount == 0{
			c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "order successfully deleted"})
	}
}
*/