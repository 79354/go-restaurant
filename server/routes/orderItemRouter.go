package routes

import(
	controller "go-restaurant/controllers"
	
	"github.com/gin-gonic/gin"
)

func RegisterOrderItemRoutes(router gin.RouterGroup){
	orderItemRouter := router.Group("/orderItems")
	{
		orderItemRouter.GET("/", controller.GetOrderItems)
		orderItemRouter.GET("/:orderItem_id", controller.GetOrderItem)
		orderItemRouter.GET("/:order_id", controller.GetItemsByOrder)
		orderItemRouter.POST("/", controller.CreateOrderItem)
		orderItemRouter.PATCH("/:orderItem_id", controller.UpdateOrderItem)
	}
}