package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Food represents menu items with details
type Food struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Food_id        string             `bson:"food_id" json:"food_id"`

	Name           *string             `bson:"name" json:"name" validate:"required,min=2,max=100"`
	Price          *float64            `bson:"price" json:"price" validate:"required,gt=0"`
	Description    *string             `bson:"description" json:"description" validate:"required,min=5"`
	Category_id    *string             `bson:"category_id" json:"category_id" validate:"required"`
	Menu_id        *string             `bson:"menu_id" json:"menu_id" validate:"required"`

	Image          *string             `bson:"image" json:"image,omitempty"`
	Available      *bool               `bson:"available" json:"available" default:"true"`

	Created_at     time.Time          `bson:"created_at" json:"created_at"`
	Updated_at     time.Time          `bson:"updated_at" json:"updated_at"`
}
