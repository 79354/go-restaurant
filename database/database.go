package database

import "go.mongodb.org/mongo-driver/mongo"

var Client *mongo.Client

func OpenCollection(client *mongo.Client, name string) *mongo.Collection{

}