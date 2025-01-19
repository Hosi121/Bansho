package auth

import (
    "os"
    "time"

    "github.com/Hosi121/Bansho/models"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/exp/slog"
)

// You can load this from environment variables or a secret manager
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
            // You can also add Audience, Issuer, etc. here if desired
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

