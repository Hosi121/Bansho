package controllers

import (
    "net/http"

    "github.com/Hosi121/Bansho/auth"
    "github.com/Hosi121/Bansho/config"
    "github.com/Hosi121/Bansho/models"
    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
)

// RegisterCredentials mirrors your front-end's RegisterCredentials type
type RegisterCredentials struct {
    Name            string `json:"name" binding:"required"`
    Email           string `json:"email" binding:"required,email"`
    Password        string `json:"password" binding:"required"`
    ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

// LoginCredentials mirrors your front-end's LoginCredentials type
type LoginCredentials struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

// AuthResponse mirrors your front-end's AuthResponse type
type AuthResponse struct {
    Token string      `json:"token"`
    User  models.User `json:"user"`
}

// Register handles user registration and returns a JWT token + user info.
func Register(c *gin.Context) {
    var req RegisterCredentials
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Confirm password
    if req.Password != req.ConfirmPassword {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
        return
    }

    // Check if user already exists
    var existingUser models.User
    if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
        // Found a user with this email
        c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    user := models.User{
        Email:        req.Email,
        Name:         req.Name,
        PasswordHash: string(hashedPassword),
        // Avatar is optional; set it if your front-end provides it.
    }

    // Create user in DB
    if err := config.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    // Generate JWT
    tokenString, err := auth.GenerateToken(user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    // Return token and user
    c.JSON(http.StatusOK, AuthResponse{
        Token: tokenString,
        User:  user,
    })
}

// Login checks user credentials and returns a JWT token + user info.
func Login(c *gin.Context) {
    var req LoginCredentials
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Look up user by email
    var user models.User
    if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Compare hashed password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Generate JWT
    tokenString, err := auth.GenerateToken(user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    // Return token and user
    c.JSON(http.StatusOK, AuthResponse{
        Token: tokenString,
        User:  user,
    })
}

