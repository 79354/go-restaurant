// database/database.go
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

func DBinstance() *mongo.Client {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found, using system env")
	}

	mongoURL := os.Getenv("MONGO_URI")
	if mongoURL == "" {
		mongoURL = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	fmt.Println("Connected to MongoDB!")
	Client = client
	return client
}

func OpenCollection(client *mongo.Client, name string) *mongo.Collection {
	return client.Database("restaurant").Collection(name)
}

var (
	UserCollection        *mongo.Collection
	FoodCollection        *mongo.Collection
	MenuCollection        *mongo.Collection
	TableCollection       *mongo.Collection
	OrderCollection       *mongo.Collection
	OrderItemCollection   *mongo.Collection
	InvoiceCollection     *mongo.Collection
)

func InitializeCollections() {
	UserCollection = OpenCollection(Client, "user")
	FoodCollection = OpenCollection(Client, "food")
	MenuCollection = OpenCollection(Client, "menu")
	TableCollection = OpenCollection(Client, "table")
	OrderCollection = OpenCollection(Client, "order")
	OrderItemCollection = OpenCollection(Client, "orderItem")
	InvoiceCollection = OpenCollection(Client, "invoice")

	log.Println("Collections initialized")
}