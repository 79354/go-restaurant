package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func DBinstance(){
	err := godotenv.Load(".env")
	if err != nil{
		log.Fatal("Error loading the .env file")
	}

	MongoDB := os.Getenv("MONGODB_URL")
	if MongoDB == ""{
		MongoDB = "mongodb://localhost:27017"
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(MongoDB))
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil{
		log.Fatal(err)
	}

	fmt.Println("Connected to mongodb!")

	Client = client
}

func OpenCollection(client *mongo.Client, name string) *mongo.Collection{
	return client.Database("restaurant").Collection(name)
}