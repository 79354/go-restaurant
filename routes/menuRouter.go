package routes

import (
	controller "go-restaurant/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterMenuRoutes(router gin.RouterGroup){
	menuRouter := router.Group("/menus")
	{
		menuRouter.GET("/", controller.GetMenus)
		menuRouter.GET("/:menu_id", controller.GetMenu)
		menuRouter.POST("/", controller.CreateMenu)
		menuRouter.PATCH("/:menu_id", controller.UpdateMenu)
	}
}