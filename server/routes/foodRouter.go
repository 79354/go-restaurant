package routes

import(
	controller "go-restaurant/controllers"

	"github.com/gin-gonic/gin"
)

// use router groups to create a path prefix: foods, instead of using gin.Engine
func RegisterFoodRoutes(router *gin.RouterGroup){
	foodRouter := router.Group("/foods")
	{
		foodRouter.GET("/", controller.GetFoods)
		foodRouter.Get("/:food_id", controller.GetFood)
		foodRouter.POST("/", controller.CreateFood)
		foodRouter.PATCH("/:food_id", controller.UpdateFood)
		foodRouter.DELETE("/:food_id", controller.DeleteFood)
	}
}