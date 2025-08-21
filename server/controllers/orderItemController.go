package controllers

import (
	"context"
	"net/http"
	"time"

	"go-restaurant/database"
	"go-restaurant/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var orderItemCollection *mongo.Collection = database.OrderItemCollection

func GetOrderItems() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := orderItemCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing order items"})
			return
		}
		defer result.Close(ctx)

		var allOrderItems []bson.M
		if err = result.All(ctx, &allOrderItems); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, allOrderItems)
	}
}

func GetOrderItemsByOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		orderId := c.Param("order_id")
		allOrderItems, err := ItemsByOrder(orderId)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error fetching order items by order ID",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, allOrderItems)
	}
}

func ItemsByOrder(id string) ([]primitive.M, error) {
	var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	matchStage := bson.D{{Key: "$match", Value: bson.D{{Key: "order_id", Value: id}}}}

	lookupStage := bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "food"},
		{Key: "localField", Value: "food_id"},
		{Key: "foreignField", Value: "food_id"},
		{Key: "as", Value: "food"},
	}}}

	unwindFood := bson.D{{Key: "$unwind", Value: bson.D{
		{Key: "path", Value: "$food"},
		{Key: "preserveNullAndEmptyArrays", Value: true},
	}}}

	lookupOrder := bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "order"},
		{Key: "localField", Value: "order_id"},
		{Key: "foreignField", Value: "order_id"},
		{Key: "as", Value: "order"},
	}}}

	unwindOrder := bson.D{{Key: "$unwind", Value: bson.D{
		{Key: "path", Value: "$order"},
		{Key: "preserveNullAndEmptyArrays", Value: true},
	}}}

	lookupTable := bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "table"},
		{Key: "localField", Value: "order.table_id"},
		{Key: "foreignField", Value: "table_id"},
		{Key: "as", Value: "table"},
	}}}

	unwindTable := bson.D{{Key: "$unwind", Value: bson.D{
		{Key: "path", Value: "$table"},
		{Key: "preserveNullAndEmptyArrays", Value: true},
	}}}

	projectStage := bson.D{{Key: "$project", Value: bson.D{
		{Key: "id", Value: 0},
		{Key: "amount", Value: "$food.price"},
		{Key: "total_count", Value: 1},
		{Key: "food_name", Value: "$food.name"},
		{Key: "food_image", Value: "$food.image"},
		{Key: "table_number", Value: "$table.table_number"},
		{Key: "table_id", Value: "$table.table_id"},
		{Key: "order_id", Value: "$order.order_id"},
		{Key: "price", Value: "$food.price"},
		{Key: "quantity", Value: 1},
	}}}

	groupStage := bson.D{{Key: "$group", Value: bson.D{
		{Key: "_id", Value: bson.D{
			{Key: "order_id", Value: "$order_id"},
			{Key: "table_id", Value: "$table_id"},
			{Key: "table_number", Value: "$table_number"},
		}},
		{Key: "payment_due", Value: bson.D{{Key: "$sum", Value: "$amount"}}},
		{Key: "total_count", Value: bson.D{{Key: "$sum", Value: 1}}},
		{Key: "order_items", Value: bson.D{{Key: "$push", Value: "$$ROOT"}}},
	}}}

	projectStage2 := bson.D{{Key: "$project", Value: bson.D{
		{Key: "_id", Value: 0},
		{Key: "payment_due", Value: 1},
		{Key: "total_count", Value: 1},
		{Key: "table_number", Value: "$_id.table_number"},
		{Key: "order_items", Value: 1},
	}}}

	pipeline := mongo.Pipeline{
		matchStage,
		lookupStage,
		unwindFood,
		lookupOrder,
		unwindOrder,
		lookupTable,
		unwindTable,
		projectStage,
		groupStage,
		projectStage2,
	}

	cursor, err := orderItemCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []primitive.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func GetOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		orderItemId := c.Param("order_item_id")
		var orderItem models.OrderItem

		err := orderItemCollection.FindOne(ctx, bson.M{"order_item_id": orderItemId}).Decode(&orderItem)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order item not found"})
			return
		}

		c.JSON(http.StatusOK, orderItem)
	}
}

func CreateOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var orderItemPack struct {
			Table_id     *string               `json:"table_id" binding:"required"`
			Order_Items  []models.OrderItem    `json:"order_items" binding:"required"`
		}

		if err := c.BindJSON(&orderItemPack); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Create parent order
		var order models.Order
		order.Table_id = orderItemPack.Table_id
		order.Order_date = time.Now().Truncate(24 * time.Hour)

		order_id, err := CreateOrderAndReturnID(order)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
			return
		}

		// Prepare order items
		var orderItemsToInsert []interface{}
		for _, item := range orderItemPack.Order_Items {
			item.Order_id = order_id
			item.Created_at = time.Now()
			item.Updated_at = time.Now()
			item.ID = primitive.NewObjectID()
			item.OrderItem_id = item.ID.Hex()

			if item.Status == "" {
				item.Status = "PENDING"
			}

			if item.Unit_price != nil {
				rounded := toFixed(*item.Unit_price, 2)
				item.Unit_price = &rounded
			}

			if item.Quantity == nil {
				zero := 0
				item.Quantity = &zero
			}

			// Calculate subtotal
			if item.Unit_price != nil && item.Quantity != nil {
				item.Subtotal = *item.Unit_price * float64(*item.Quantity)
			}

			validationErr := validate.Struct(item)
			if validationErr != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
				return
			}

			orderItemsToInsert = append(orderItemsToInsert, item)
		}

		// Insert all order items
		result, err := orderItemCollection.InsertMany(ctx, orderItemsToInsert)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert order items"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Order items created successfully",
			"order_id": order_id,
			"inserted_ids": result.InsertedIDs,
		})
	}
}

func UpdateOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var orderItem models.OrderItem
		if err := c.BindJSON(&orderItem); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		orderItemID := c.Param("order_item_id")
		filter := bson.M{"order_item_id": orderItemID}

		var updateObj primitive.D

		if orderItem.Unit_price != nil {
			updateObj = append(updateObj, bson.E{Key: "unit_price", Value: orderItem.Unit_price})
		}

		if orderItem.Quantity != nil {
			updateObj = append(updateObj, bson.E{Key: "quantity", Value: orderItem.Quantity})
		}

		if orderItem.Food_id != nil {
			updateObj = append(updateObj, bson.E{Key: "food_id", Value: orderItem.Food_id})
		}

		if orderItem.Status != "" {
			updateObj = append(updateObj, bson.E{Key: "status", Value: orderItem.Status})
		}

		updateObj = append(updateObj, bson.E{Key: "updated_at", Value: time.Now()})

		if len(updateObj) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
			return
		}

		opts := options.Update().SetUpsert(false)
		result, err := orderItemCollection.UpdateOne(
			ctx,
			filter,
			bson.D{{Key: "$set", Value: updateObj}},
			opts,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order item not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Order item updated",
			"modified": result.ModifiedCount,
		})
	}
}