package routes

import(
	controller "go-restaurant/controllers"
	
	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(router gin.RouterGroup){
	userRouter := router.Group("/users")
	{
		userRouter.GET("/", controller.GetUsers)
		userRouter.GET("/:id", controller.GetUser)
		userRouter.POST("/signup", controller.Signup)
		userRouter.POST("/login", controller.Login)
	}
}