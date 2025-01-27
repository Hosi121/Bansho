package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"log/slog"

	"github.com/Hosi121/Bansho/models"
	"github.com/golang-jwt/jwt/v5"
)

// 環境変数から取得した JWT_SECRET を使用
var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

// Claims is the internal JWT payload structure.
type Claims struct {
	Sub   uint   `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT string containing user info.
func GenerateToken(user models.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		Sub:   user.ID,
		Email: user.Email,
		Name:  user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			// ここに Audience, Issuer など追加可能
		},
	}

	// Create a token object
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		slog.Error("failed to sign token", slog.String("error", err.Error()))
		return "", err
	}

	return tokenString, nil
}

// ParseToken はトークン文字列をパースし、Claims を取得する
func ParseToken(tokenString string) (*Claims, error) {
	if len(jwtSecret) == 0 {
		return nil, errors.New("jwt secret is not set")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		// HS256 を想定
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Claims の型チェックと token のバリデーション
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token or claims")
	}

	return claims, nil
}
