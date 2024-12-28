package middlewares

import (
	"net/http"
	"os"

	"log/slog"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		env := os.Getenv("ENV")
		allowedOrigin := ""

		if env == "production" {
			if origin == "https://your-vercel-app.vercel.app" {
				allowedOrigin = origin
			}
		} else {
			allowedOrigin = "http://localhost:3000"
		}

		if allowedOrigin != "" {
			slog.Info("CORS allowed", slog.String("origin", allowedOrigin))
			c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		} else {
			slog.Warn("CORS denied", slog.String("origin", origin))
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		c.Next()
	}
}
