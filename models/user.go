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


// Category represents food categories
type Category struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Category_id    string             `bson:"category_id" json:"category_id"`
	Name           string             `bson:"name" json:"name" validate:"required,min=2,max=50"`
	Description    string             `bson:"description" json:"description,omitempty"`
	Created_at     time.Time          `bson:"created_at" json:"created_at"`
	Updated_at     time.Time          `bson:"updated_at" json:"updated_at"`
}


// Employee represents restaurant staff
type Employee struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Employee_id    string             `bson:"employee_id" json:"employee_id"`
	User_id        string             `bson:"user_id" json:"user_id" validate:"required"`
	Position       string             `bson:"position" json:"position" validate:"required,eq=MANAGER|eq=CHEF|eq=SERVER|eq=HOSTESS|eq=BARTENDER"`
	Hourly_rate    float64            `bson:"hourly_rate" json:"hourly_rate,omitempty"`
	Hire_date      time.Time          `bson:"hire_date" json:"hire_date"`
	Status         string             `bson:"status" json:"status" validate:"required,eq=ACTIVE|eq=INACTIVE"`
	Created_at     time.Time          `bson:"created_at" json:"created_at"`
	Updated_at     time.Time          `bson:"updated_at" json:"updated_at"`
}