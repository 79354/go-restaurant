package helpers

import (
	"go-restaurant/database"
	"os"
	"time"
	"errors"
	"context"

	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SignedDetails struct{
	User_ID    string
	Email 	   string
	First_name string
	Last_name  string
	Role 	   string
	jwt.RegisteredClaims
}

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")
var SECRET_KEY string = os.Getenv("JWT_SECRET_KEY")

func GenerateAllToken(email string, first_name string, last_name string, uid string, role string) (signedToken string, signedRefreshToken string, err error){
	// Token expiry: 24hrs
	claims := &SignedDetails{
		User_ID: uid,
		Email: email,
		First_name: first_name,
		Last_name: last_name,
		Role: role,

		RegisteredClaims :jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Local().Add(time.Hour*24)),
			IssuedAt: jwt.NewNumericDate(time.Now().Local()),
			NotBefore: jwt.NewNumericDate(time.Now().Local()),
		},
	}

	// Token expiry: 7days
	refreshClaims := &SignedDetails{
		User_ID: uid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Local().Add(time.Hour*24)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Local()),
			NotBefore: jwt.NewNumericDate(time.Now().Local()),
		},
	}

	// func jwt.NewWithClaims(method jwt.SigningMethod, claims jwt.Claims) *jwt.Token
	// method: HMAC + SHA256

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(SECRET_KEY))
	if err != nil {
		return "", "", err
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(SECRET_KEY))
	if err != nil {
		return "", "", err
	}

	return token, refreshToken, nil
}

func ValidateToken(signedToken string) (claims *SignedDetails, msg string) {
	if SECRET_KEY == "" {
		msg := "JWT secret key not available"
		return nil, msg
	}

	token, err := jwt.ParseWithClaims(
		signedToken,
		&SignedDetails{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(SECRET_KEY), nil
		},
	)

	if err != nil{
		msg := "error parsing claims"
		return nil, msg
	}

	claims, ok := token.Claims.(*SignedDetails)
	if !ok {
		msg := "the token is invalid"
		return nil, msg
	}

	// Check if token is expired
	if claims.ExpiresAt.Time.Before(time.Now().Local()){
		msg := "token is expired"
		return nil, msg
	}

	return claims, ""
}

func UpdateAllTokens(signedToken string, signedRefreshToken string, userId string){
	var ctx, cancel := context.WithTimeout(context.Backgound(), 10*time.Second)
	defer cancel()

	updatedAt := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

	result, err := userCollection.UpdateOne(
		ctx,
		bson.M{"user_id": userId},
		bson.D{{"$set", bson.D{
			{"token", signedToken},
			{"refresh_token", signedRefreshToken},
			{"updated_at", updatedAt},
		}}},
		&options.UpdateOptions{
			Upsert: true
		},
	)

	if err != nil {
		log.Panic(err)
	}
}
