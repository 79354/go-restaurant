package routes

import(
	controller "go-restaurant/controllers"
	
	"github.com/gin-gonic/gin"
)

func RegisterOrderRoutes(router gin.RouterGroup){
	orderRouter := router.Group("/orders")
	{
		orderRouter.GET("/", controller.GetOrders)
		orderRouter.GET("/:order_id", controller.GetOrder)
		orderRouter.POST("/", controller.CreateOrder)
		orderRouter.PATCH("/:order_id", controller.UpdateOrder)
	}
}