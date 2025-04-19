package models

import (
	"time"
	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Category represents food categories
type Category struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Category_id    string             `bson:"category_id" json:"category_id"`
	Name           string             `bson:"name" json:"name" validate:"required,min=2,max=50"`
	Description    string             `bson:"description" json:"description,omitempty"`
	Created_at     time.Time          `bson:"created_at" json:"created_at"`
	Updated_at     time.Time          `bson:"updated_at" json:"updated_at"`
}