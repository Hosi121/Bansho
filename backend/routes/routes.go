package routes

import (
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	api := r.Group("/api/v1")
	{
		RelationRoutes(api) // 関連性を見るルート
		DocumentRoutes(api) // ドキュメント関連のルート
		AuthRoutes(r)
	}

	return r
}
