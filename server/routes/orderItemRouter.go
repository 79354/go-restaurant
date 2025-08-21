package routes

import(
	controller "go-restaurant/controllers"
	
	"github.com/gin-gonic/gin"
)

func RegisterOrderItemRoutes(router *gin.RouterGroup){
	orderItemRouter := router.Group("/orderItems")
	{
		orderItemRouter.GET("/", controller.GetOrderItems())
		orderItemRouter.GET("/:order_Item_id", controller.GetOrderItem())
		orderItemRouter.GET("/by-order/:order_id", controller.GetOrderItemsByOrder())
		orderItemRouter.POST("/", controller.CreateOrderItem())
		orderItemRouter.PATCH("/:order_Item_id", controller.UpdateOrderItem())
	}
}