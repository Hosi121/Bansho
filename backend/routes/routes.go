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

    api := r.Group("/api/v1")
    {
        RelationRoutes(api)    // 関連性を見るルート
        DocumentRoutes(api)    // ドキュメント関連のルート
        AuthRoutes(api)        // 認証関連のルート
        ProfileRoutes(db, api) // プロフィール関連のルートを追加
    }

    return r
}

