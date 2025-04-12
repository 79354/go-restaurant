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

var invoiceCollection *mongo.Collection = database.OpenCollection(database.Client, "invoice")

type InvoiceViewFormat struct{
	Invoice_id       string      `json:"invoice_id"`
	Payment_method   string      `json:"payment_method"`
	Order_id         string      `json:"order_id"`
	Payment_status   *string     `json:"payment_status"`
	Payment_due      interface{} `json:"payment_due"`
	Table_number     interface{} `json:"table_number"`
	Payment_due_date time.Time   `json:"payment_due_date"`
	Order_details    interface{} `json:"order_details"`
}

func GetInvoices() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := invoiceCollection.Find(ctx, bson.M{})
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing invoice items"})
			return
		}

		var allInvoices []bson.M
		if err = result.All(ctx, &allInvoices); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing invoice items"})
			return
		}
		c.JSON(http.StatusOK, allInvoices)
	}
}

func GetInvoice() gin.HandlerFunc{
return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		invoiceID := c.Param("invoice_id")
		var invoice models.Invoice

		err := invoiceCollection.FindOne(ctx, bson.M{"invoice_id": invoiceID}).Decode(&invoice)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return
		}
		var invoiceView InvoiceViewFormat

		// Get order items associated with this invoice
		allOrderItems, err := ItemsByOrder(invoice.Order_id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error retrieving order items"})
		}

		if len(allOrderItems) == 0{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No order item associated with this invoice found"})
		}

		invoiceView.Order_id = invoice.Order_id
		invoiceView.Payment_due_date = invoice.Payment_due_date
		invoiceView.Invoice_id = invoice.Invoice_id
		invoiceView.Payment_status = invoice.Payment_status

		// payment method could be nil/ or empty
		invoiceView.Payment_method = "null"
		if invoice.Payment_method != nil{
			invoiceView.Payment_method = *invoice.Payment_method
		}

		// set the order details
		invoiceView.Payment_due = allOrderItems[0]["payment_due"]
		invoiceView.Table_number = allOrderItems[0]["table_number"]
		invoiceView.Order_details = allOrderItems[0]["order_items"]

		c.JSON(http.StatusOK, invoiceView)
	}
}

func CreateInvoice() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel ()

		// parse the invoice body into invoice struct
		var invoice models.Invoice
		if err := c.BindJSON(&invoice); err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// validate the order_id exists
		var order models.Order
		err := orderCollection.FindOne(ctx, bson.M{"order_id": invoice.Order_id}).Decode(&order)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Order was not found"})
			return
		}

		// default payment status
		status := "PENDING"
		if invoice.Payment_status != nil{
			invoice.Payment_status = &status
		}

		invoice.Payment_due_date, _ = time.Parse(time.RFC3339, time.Now().AddDate(0, 0, 1).Format(time.RFC3339))
		invoice.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		invoice.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		invoice.ID = primitive.NewObjectID
		invoice.Invoice_id = invoice.ID.Hex()

		if err := validate.Struct(invoice); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, insertErr := invoiceCollection.InsertOne(ctx, invoice)
		if insertErr != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invoice item was not created"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{
			"message": "invoice successfully created.",
			"invoice_id": invoice.Invoice_id,
			"result": result,
		})
	}
}

func UpdateInvoice() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel ()

		var invoice models.Invoice

		if err := c.BindJSON(&invoice); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		invoiceId := c.Param("invoice_id")

		// check if the invoice exists
		var existingInvoice models.Invoice
		err := invoiceCollection.FindOne(ctx, bson.M{"invoice_id": invoiceId}).Decode(&existingInvoice)
		if err != nil{
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return

		}

		// Create update Document
		// var updateObj primitive.D
		updateObj := bson.D{}

		// partial updates: only for fields that are provided
		if invoice.Payment_method != nil{
			updateObj = append(updateObj, bson.M{Key: "payment_method", Value: invoice.Payment_method})
		}

		if invoice.Payment_status != nil{
			updateObj = append(updateObj, bson.M{Key: "payment_status", Value: invoice.Payment_status})
		}

		if invoice.Payment_status != nil && *invoice.Payment_status == "PAID" && existingInvoice.Payment_status != nil && *existingInvoice.Payment_status != "PAID"{
			paymentDate, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
			updateObj = append(updateObj, bson.E{Key: "payment_date", Value: paymentDate})
		}

		invoice.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		updateObj = append(updateObj, bson.E{"update_at", invoice.Updated_at})

		opts := options.Update().SetUpsert(true)

		filter := bson.M{"invoice_id": invoiceId}
		result, err := invoiceCollection.UpdateOne(
			ctx,
			filter,
			bson.D{{"$set", updateObj}},
			opts,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invoice item update failed"})
			return
		}

		// check if any document was modified
		if result.MatchedCount == 0{
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "invoice update successfully",
			"result": result,
		})
	}
}

func DeleteCount() gin.Context{
	return func(c *gin.Context){
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel ()

		invoiceID := c.Param("invoice_id")

		// check if the invoice exists before deleting
		var invoice models.Invoice
		err := invoiceCollection.FindOne(ctx, bson.M{"invoice_id": invoiceID}).Decode(&invoice)
		if err != nil{
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return
		}

		// check if invoice can be deleted
		if invoice.Payment_status != nil && *invoice.Payment_status == "PAID" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "paid invoices cannot be deleted"})
			return
		}

		result, err := 
	}
}