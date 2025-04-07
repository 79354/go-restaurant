package main

import (
	"os"

	"go-restaurant/database"
	"go-restaurant/middleware"
	"go-restaurant/routes"

	"github.com/gin-gonic/gin"
)

func main(){
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.New()
	r.Use(gin.Logger())

// func (group *gin.RouterGroup) Group(relativePath string, handlers ...gin.HandlerFunc) *gin.RouterGroup
	publicRoutes := r.Group("/api")
	{
		// auth end points: login/ register
		routes.UserRoutes(publicRoutes)
	}

	protectedRoutes := r.Group("/api")
	protectedRoutes.Use(middleware.Authentication())
	{
		routes.FoodRoutes(protectedRoutes)
		routes.MenuRoutes(protectedRoutes)
		routes.TableRoutes(protectedRoutes)
		routes.OrderRoutes(protectedRoutes)
		routes.OrderItemRoutes(protectedRoutes)
		routes.InvoiceRoutes(protectedRoutes)
	}

	r.Run(":" + port)
}