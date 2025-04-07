package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Table represents restaurant tables
type Table struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Table_id         string             `bson:"table_id" json:"table_id"`
	Table_number     int                `bson:"table_number" json:"table_number" validate:"required,gt=0"`
	Capacity         int                `bson:"capacity" json:"capacity" validate:"required,gt=0"`
	Status           string             `bson:"status" json:"status" validate:"required,eq=AVAILABLE|eq=OCCUPIED|eq=RESERVED"`
	Location         string             `bson:"location" json:"location,omitempty"`
	Current_order_id string             `bson:"current_order_id" json:"current_order_id,omitempty"`
	Created_at       time.Time          `bson:"created_at" json:"created_at"`
	Updated_at       time.Time          `bson:"updated_at" json:"updated_at"`
}