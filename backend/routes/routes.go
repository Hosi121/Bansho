package routes

import (
	"github.com/Hosi121/Bansho/middlewares"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	// 例: API v1 のルートグループを作る
	api := r.Group("/api/v1")

	// ... /api/v1 配下のルートを定義
	RelationRoutes(api)    // 関連性を見るルート
	DocumentRoutes(api)    // ドキュメント関連のルート
	AuthRoutes(api)        // 認証関連のルート (ログイン等)
	ProfileRoutes(db, api) // プロフィール関連のルート

	// 認証が必要なルート例
	authRequired := api.Group("/auth-required")
	authRequired.Use(middlewares.JWTAuthMiddleware())
	{
		authRequired.GET("/secret", func(c *gin.Context) {
			userID := c.GetInt("userID")
			userEmail := c.GetString("userEmail")
			userName := c.GetString("userName")

			c.JSON(200, gin.H{
				"message":   "Authorized endpoint",
				"userID":    userID,
				"userEmail": userEmail,
				"userName":  userName,
			})
		})
	}
}
