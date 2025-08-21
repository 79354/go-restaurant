package main

import (
	"log"
	"net/http"
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

	database.DBinstance()
	database.Client = database.DBinstance()
	database.InitializeCollections()

	r := gin.New()
	r.Use(gin.Logger())

	r.Use(middleware.CORSMiddleware())
	r.GET("/api/health-check", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Server is running"})
	})

// func (group *gin.RouterGroup) Group(relativePath string, handlers ...gin.HandlerFunc) *gin.RouterGroup
	publicRoutes := r.Group("/api")
	{
		// auth end points: login/ register
		routes.RegisterUserRoutes(publicRoutes)
	}

	protectedRoutes := r.Group("/api")
	protectedRoutes.Use(middleware.Authentication())
	{
		routes.RegisterFoodRoutes(protectedRoutes)
		routes.RegisterMenuRoutes(protectedRoutes)
		routes.RegisterTableRoutes(protectedRoutes)
		routes.RegisterOrderRoutes(protectedRoutes)
		routes.RegisterOrderItemRoutes(protectedRoutes)
		routes.RegisterInvoiceRoutes(protectedRoutes)
	}

	log.Printf("Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
