package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Invoice represents payment documents generated for orders
type Invoice struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Invoice_id        string             `bson:"invoice_id" json:"invoice_id"`
	Order_id          string             `bson:"order_id" json:"order_id" validate:"required"`
	Customer_id       string             `bson:"customer_id" json:"customer_id"`
	Payment_method    string             `bson:"payment_method" json:"payment_method" validate:"eq=CARD|eq=CASH|eq=MOBILE_PAYMENT|eq=GIFT_CARD|eq=CREDIT"`
	Payment_status    string             `bson:"payment_status" json:"payment_status" validate:"required,eq=PENDING|eq=PAID|eq=FAILED|eq=REFUNDED|eq=PARTIALLY_PAID"`
	Tax_amount        float64            `bson:"tax_amount" json:"tax_amount" validate:"required,gte=0"`
	Total_amount      float64            `bson:"total_amount" json:"total_amount" validate:"required,gt=0"`
	Notes             string             `bson:"notes" json:"notes,omitempty"`
	Transaction_id    string             `bson:"transaction_id" json:"transaction_id,omitempty"`
	Receipt_url       string             `bson:"receipt_url" json:"receipt_url,omitempty"`
	Is_sent           bool               `bson:"is_sent" json:"is_sent" default:"false"`
	
	Sent_at           time.Time          `bson:"sent_at" json:"sent_at,omitempty"`
	Payment_date      time.Time          `bson:"payment_date" json:"payment_date,omitempty"`
	Payment_due_date  time.Time          `bson:"payment_due_date" json:"payment_due_date"`
	
	Created_at        time.Time          `bson:"created_at" json:"created_at"`
	Updated_at        time.Time          `bson:"updated_at" json:"updated_at"`
}