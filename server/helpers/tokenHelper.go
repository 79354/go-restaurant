package helpers

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"go-restaurant/database"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type SignedDetails struct {
	User_ID      string
	Email        string
	First_name   string
	Last_name    string
	Role         string
	jwt.RegisteredClaims
}

// Implement Valid method to satisfy jwt.Claims interface

func (s *SignedDetails) Valid() error {
    now := time.Now().UTC()
    if s.ExpiresAt != nil && now.After(s.ExpiresAt.Time) {
        return errors.New("token is expired")
    }
    if s.IssuedAt != nil && now.Before(s.IssuedAt.Time) {
        return errors.New("token used before issued")
    }
    if s.NotBefore != nil && now.Before(s.NotBefore.Time) {
        return errors.New("token is not valid yet")
    }
    return nil
}

var userCollection *mongo.Collection = database.UserCollection
var SECRET_KEY string = os.Getenv("JWT_SECRET_KEY")

// HashPassword hashes the password using bcrypt
func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		panic(err)
	}
	return string(bytes)
}

// VerifyPassword verifies the password against the hash
func VerifyPassword(userPassword string, providedPassword string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	if err != nil {
		return false, "Login or password is incorrect"
	}
	return true, "Login Success"
}

func GenerateAllToken(email string, firstName string, lastName string, uid string, role string) (signedToken string, signedRefreshToken string, err error) {
	// Token expiry: 24 hours
	claims := &SignedDetails{
		User_ID:    uid,
		Email:      email,
		First_name: firstName,
		Last_name:  lastName,
		Role:       role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	// Refresh token expiry: 7 days
	refreshClaims := &SignedDetails{
		User_ID: uid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(168 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err = token.SignedString([]byte(SECRET_KEY))
	if err != nil {
		return "", "", err
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err = refreshToken.SignedString([]byte(SECRET_KEY))
	if err != nil {
		return "", "", err
	}

	return signedToken, signedRefreshToken, nil
}

func ValidateToken(signedToken string) (*SignedDetails, string) {
	if SECRET_KEY == "" {
		return nil, "JWT secret key not available"
	}

	token, err := jwt.ParseWithClaims(signedToken, &SignedDetails{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(SECRET_KEY), nil
	})

	if err != nil {
		return nil, "error parsing token: " + err.Error()
	}

	claims, ok := token.Claims.(*SignedDetails)
	if !ok || !token.Valid {
		return nil, "the token is invalid"
	}

	if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, "token is expired"
	}

	return claims, ""
}

func UpdateAllTokens(signedToken string, signedRefreshToken string, userId string) {
	var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	updatedAt := time.Now().Format(time.RFC3339)

	upsert := true
	result, err := userCollection.UpdateOne(
		ctx,
		bson.M{"user_id": userId},
		bson.D{
			{Key: "$set", Value: bson.D{
				{Key: "token", Value: signedToken},
				{Key: "refresh_token", Value: signedRefreshToken},
				{Key: "updated_at", Value: updatedAt},
			}},
		},
		&options.UpdateOptions{
			Upsert: &upsert,
		},
	)

	if err != nil {
		log.Panic(err)
	}
	log.Println("Token updated successfully:", result.UpsertedID)
}