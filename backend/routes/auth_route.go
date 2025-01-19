package routes

import (
    "github.com/Hosi121/Bansho/controllers"
    "github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
    authGroup := r.Group("/api/v1/auth")
    {
        authGroup.POST("/register", controllers.Register)
        authGroup.POST("/login", controllers.Login)
    }
}

