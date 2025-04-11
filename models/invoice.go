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
	Payment_method    *string             `bson:"payment_method" json:"payment_method" validate:"eq=CARD|eq=CASH|eq=MOBILE_PAYMENT|eq=GIFT_CARD|eq=CREDIT"`
	Payment_status    *string             `bson:"payment_status" json:"payment_status" validate:"required,eq=PENDING|eq=PAID|eq=FAILED|eq=REFUNDED|eq=PARTIALLY_PAID"`
	
	Sent_at           time.Time          `bson:"sent_at" json:"sent_at,omitempty"`
	Payment_date      time.Time          `bson:"payment_date" json:"payment_date,omitempty"`
	Payment_due_date  time.Time          `bson:"payment_due_date" json:"payment_due_date"`
	
	Created_at        time.Time          `bson:"created_at" json:"created_at"`
	Updated_at        time.Time          `bson:"updated_at" json:"updated_at"`
}