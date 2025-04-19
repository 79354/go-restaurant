package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// OrderItem represents individual items in an order
type OrderItem struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderItem_id     string             `bson:"order_item_id" json:"order_item_id"`

	Order_id         string             `bson:"order_id" json:"order_id" validate:"required"`
	Food_id          *string             `bson:"food_id" json:"food_id" validate:"required"`
	Quantity         *int                `bson:"quantity" json:"quantity" validate:"required,gt=0"`
	Unit_price       *float64            `bson:"unit_price" json:"unit_price" validate:"required,gt=0"`

	Subtotal         float64            `bson:"subtotal" json:"subtotal"`
	Status           string             `bson:"status" json:"status" validate:"eq=PENDING|eq=PREPARING|eq=READY|eq=DELIVERED|eq=CANCELLED"`

	Created_at       time.Time          `bson:"created_at" json:"created_at"`
	Updated_at       time.Time          `bson:"updated_at" json:"updated_at"`
}