package middlewares

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Allow the specific origin
        origin := c.Request.Header.Get("Origin")
        c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
        
        // Essential CORS headers
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Requested-By")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
        c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
        c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")

        // Handle preflight requests
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent) // 204
            return
        }

        c.Next()
    }
}