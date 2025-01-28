package routes

import (
	"github.com/Hosi121/Bansho/controllers"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(api *gin.RouterGroup) {
	authGroup := api.Group("/auth")
	{
		// Add OPTIONS handler in the auth group
		authGroup.OPTIONS("/*path", func(c *gin.Context) {
			c.Status(200)
		})
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)
	}
}
