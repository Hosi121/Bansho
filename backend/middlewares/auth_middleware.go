package middlewares

import (
	"net/http"
	"strings"

	"github.com/Hosi121/Bansho/auth"
	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorization: Bearer xxxxx
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is missing",
			})
			return
		}

		// "Bearer " を取り除いて JWT 部分を抽出
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header format must be Bearer {token}",
			})
			return
		}

		// Token をパースして Claims を取得
		claims, err := auth.ParseToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
			})
			return
		}

		// コンテキストにユーザー情報を詰めておけば、あとでハンドラ内で取り出せる
		c.Set("userID", claims.Sub)
		c.Set("userEmail", claims.Email)
		c.Set("userName", claims.Name)

		// ここで次のハンドラへ
		c.Next()
	}
}
