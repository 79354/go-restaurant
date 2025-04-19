package models

import (
	"time"
	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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