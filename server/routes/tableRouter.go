package routes

import(
	controller "go-restaurant/controllers"
	
	"github.com/gin-gonic/gin"
)

func RegisterTableRoutes(router gin.RouterGroup){
	tableRouter := router.Group("/tables")
	{
		tableRouter.GET("/", controller.GetTables)
		tableRouter.GET("/:table_id", controller.GetTable)
		tableRouter.POST("/", controller.CreateTable)
		tableRouter.PATCH("/:table_id", controller.UpdateTable)
	}
}