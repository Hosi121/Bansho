package routes

import (
	"github.com/Hosi121/Bansho/controllers"
	"github.com/gin-gonic/gin"
)

// DocumentRoutes - ドキュメントに関するルートを設定
func DocumentRoutes(r *gin.RouterGroup) {
	doc := r.Group("/documents")
	{
		doc.GET("/", controllers.GetDocuments) // ドキュメント一覧取得
		doc.GET("/documents/user/:userId", controllers.GetDocumentsByUserID)
		doc.GET("/:id", controllers.GetDocumentByID)   // 特定のドキュメント取得
		doc.POST("/", controllers.CreateDocument)      // 新しいドキュメント作成
		doc.PUT("/:id", controllers.UpdateDocument)    // ドキュメント更新
		doc.DELETE("/:id", controllers.DeleteDocument) // ドキュメント削除
	}
}
