package models

import (
	"time"
	
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Reservation represents table reservations
type Reservation struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Reservation_id     string             `bson:"reservation_id" json:"reservation_id"`
	User_id            string             `bson:"user_id" json:"user_id" validate:"required"`
	Table_id           string             `bson:"table_id" json:"table_id" validate:"required"`
	Reservation_date   time.Time          `bson:"reservation_date" json:"reservation_date" validate:"required"`
	Start_time         time.Time          `bson:"start_time" json:"start_time" validate:"required"`
	End_time           time.Time          `bson:"end_time" json:"end_time" validate:"required"`
	Number_of_guests   int                `bson:"number_of_guests" json:"number_of_guests" validate:"required,gt=0"`
	Status             string             `bson:"status" json:"status" validate:"required,eq=PENDING|eq=CONFIRMED|eq=CANCELLED|eq=COMPLETED"`
	Special_request    string             `bson:"special_request" json:"special_request,omitempty"`
	Contact_phone      string             `bson:"contact_phone" json:"contact_phone" validate:"required"`
	Created_at         time.Time          `bson:"created_at" json:"created_at"`
	Updated_at         time.Time          `bson:"updated_at" json:"updated_at"`
}