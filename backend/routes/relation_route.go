package routes

import (
	"github.com/Hosi121/Bansho/controllers"
	"github.com/gin-gonic/gin"
)

// RelationRoutes - ドキュメント関連性のルートを設定
func RelationRoutes(r *gin.RouterGroup) {
	relations := r.Group("/relations")
	{
		relations.POST("/", controllers.CalculateRelation) // ドキュメント関連性を計算
	}
}

