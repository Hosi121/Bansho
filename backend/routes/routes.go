package routes

import (
	"github.com/Hosi121/Bansho/middlewares"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRoutes はルーティングを設定し、エンジンを返します。
func SetupRoutes(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	// CORSミドルウェアを追加
	r.Use(middlewares.CORSMiddleware())

	// /api/v1
	api := r.Group("/api/v1")
	{
		RelationRoutes(api)    // 関連性を見るルート
		DocumentRoutes(api)    // ドキュメント関連のルート
		AuthRoutes(api)        // 認証関連のルート (ログイン等)
		ProfileRoutes(db, api) // プロフィール関連のルート
	}

	// 認証必須のルートグループを例示
	// (ProfileRoutes などを守りたい場合は、このグループの中に書いてもOK)
	authRequired := api.Group("/auth-required")
	authRequired.Use(middlewares.JWTAuthMiddleware())
	{
		// ここに認証が必要な各エンドポイントを定義
		authRequired.GET("/secret", func(c *gin.Context) {
			// JWTAuthMiddleware でセットした情報を取り出す例
			userID := c.GetInt("userID") // Set したときのキーは "userID"
			userEmail := c.GetString("userEmail")
			userName := c.GetString("userName")

			c.JSON(200, gin.H{
				"message":   "Authorized endpoint",
				"userID":    userID,
				"userEmail": userEmail,
				"userName":  userName,
			})
		})

		// 他の認証必須エンドポイントも追加可能
	}

	return r
}
