package routes

import (
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	api := r.Group("/api/v1")
	{
		DocumentRoutes(api) // ドキュメント関連のルートを登録
	}

	return r
}

