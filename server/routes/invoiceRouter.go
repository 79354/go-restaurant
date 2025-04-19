package routes

import(
	controller "go-restaurant/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterInvoiceRoutes(router gin.RouterGroup){
	invoiceRouter := router.Group("/invoices")
	{
		invoiceRouter.GET("/", controller.GetInvoices)
		invoiceRouter.GET("/:invoice_id", controller.GetInvoice)
		invoiceRouter.POST("/", controller.CreateInvoice)
		invoiceRouter.PATCH("/:invoice_id", controller.UpdateInvoice)
	}
}