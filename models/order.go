package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Order represents customer orders
type Order struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Order_id         string             `bson:"order_id" json:"order_id"`
	Created_at       time.Time          `bson:"created_at" json:"created_at"`
	Updated_at       time.Time          `bson:"updated_at" json:"updated_at"`
	
	Order_date       time.Time          `bson:"order_date" json:"order_date"`
	Status           *string             `bson:"status" json:"status" validate:"required,eq=PENDING|eq=PROCESSING|eq=COMPLETED|eq=CANCELLED"`
	Payment_status   *string             `bson:"payment_status" json:"payment_status" validate:"required,eq=PENDING|eq=PAID|eq=FAILED"`
	Table_id         *string             `bson:"table_id" json:"table_id" validate:"required"`
	
	Payment_method   *string             `bson:"payment_method" json:"payment_method,omitempty"`
	Payment_id       string             `bson:"payment_id" json:"payment_id,omitempty"`

	// Tax              float64            `bson:"tax" json:"tax"`
	// Tip              float64            `bson:"tip" json:"tip,omitempty"`
	// Total_amount     float64            `bson:"total_amount" json:"total_amount"`

}