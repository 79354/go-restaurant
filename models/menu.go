package models

import (
	"time"	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Menu represents restaurant menus (breakfast, lunch, dinner, etc.)
type Menu struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Menu_id        *string             `bson:"menu_id" json:"menu_id"`
	Name           string             `bson:"name" json:"name" validate:"required,min=2,max=50"`
	Description    string             `bson:"description" json:"description,omitempty"`
	Start_time     time.Time          `bson:"start_time" json:"start_time,omitempty"`
	End_time       time.Time          `bson:"end_time" json:"end_time,omitempty"`
	Active         bool               `bson:"active" json:"active" default:"true"`
	Created_at     time.Time          `bson:"created_at" json:"created_at"`
	Updated_at     time.Time          `bson:"updated_at" json:"updated_at"`
}
