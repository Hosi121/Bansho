package routes

import (
    "github.com/Hosi121/Bansho/middlewares"
    "github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
    r := gin.Default()
    
    // Add CORS middleware at the router level
    r.Use(middlewares.CORSMiddleware())

    api := r.Group("/api/v1")
    {
        RelationRoutes(api)    // 関連性を見るルート
        DocumentRoutes(api)    // ドキュメント関連のルート
        AuthRoutes(api)        // Changed from r to api
    }

    return r
}