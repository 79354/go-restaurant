package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Order represents customer orders
type Order struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Order_id         string             `bson:"order_id" json:"order_id"`
	Table_id         string             `bson:"table_id" json:"table_id"`
	User_id          string             `bson:"user_id" json:"user_id"`
	Server_id        string             `bson:"server_id" json:"server_id,omitempty"`
	Order_date       time.Time          `bson:"order_date" json:"order_date"`
	Status           string             `bson:"status" json:"status" validate:"required,eq=PENDING|eq=PROCESSING|eq=COMPLETED|eq=CANCELLED"`
	Payment_status   string             `bson:"payment_status" json:"payment_status" validate:"required,eq=PENDING|eq=PAID|eq=FAILED"`
	Payment_method   string             `bson:"payment_method" json:"payment_method,omitempty"`
	Payment_id       string             `bson:"payment_id" json:"payment_id,omitempty"`
	Subtotal         float64            `bson:"subtotal" json:"subtotal"`
	Tax              float64            `bson:"tax" json:"tax"`
	Tip              float64            `bson:"tip" json:"tip,omitempty"`
	Total_amount     float64            `bson:"total_amount" json:"total_amount"`
	Special_request  string             `bson:"special_request" json:"special_request,omitempty"`
	Number_of_guests int                `bson:"number_of_guests" json:"number_of_guests" validate:"required,gt=0"`
	Created_at       time.Time          `bson:"created_at" json:"created_at"`
	Updated_at       time.Time          `bson:"updated_at" json:"updated_at"`
}