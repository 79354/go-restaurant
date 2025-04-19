package models

import (
	"time"
	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a system user (customer, staff, or admin)
type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	User_id        string             `bson:"user_id" json:"user_id"`
	
	First_name     string             `bson:"first_name" json:"first_name" validate:"required,min=2,max=100"`
	Last_name      string             `bson:"last_name" json:"last_name" validate:"required,min=2,max=100"`
	Password       string             `bson:"password" json:"-" validate:"required,min=6"`
	Email          string             `bson:"email" json:"email" validate:"email,required"`
	Phone          string             `bson:"phone" json:"phone" validate:"required"`
	
	Avatar         string             `bson:"avatar" json:"avatar,omitempty"`
	
	Role           string             `bson:"role" json:"role" validate:"required,eq=ADMIN|eq=STAFF|eq=USER"`
	Token          string             `bson:"token" json:"token,omitempty"`
	Refresh_token  string             `bson:"refresh_token" json:"refresh_token,omitempty"`
	Created_at     time.Time          `bson:"created_at" json:"created_at"`
	Updated_at     time.Time          `bson:"updated_at" json:"updated_at"`
}
