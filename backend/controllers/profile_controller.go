package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/Hosi121/Bansho/auth"
	"github.com/Hosi121/Bansho/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ProfileController はユーザープロフィールの更新に関するハンドラを管理します
type ProfileController struct {
	DB *gorm.DB
}

// NewProfileController は新しい ProfileController を作成します
func NewProfileController(db *gorm.DB) *ProfileController {
	return &ProfileController{DB: db}
}

// UpdateProfileRequest は /api/v1/users/:id のボディ用のリクエストモデルです
type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	// 必要に応じてパスワードなどを扱う場合はフィールドを追加してください
	// Password string `json:"password"`
}

// UpdateProfile はユーザー名やメールアドレスなどのプロフィールを更新するエンドポイントです
//
// [PUT] /api/v1/users/:id
func (pc *ProfileController) UpdateProfile(c *gin.Context) {
	// パスパラメータから userID を取得
	userID := c.Param("id")

	// リクエストボディをパース
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストのパラメータが不正です: " + err.Error()})
		return
	}

	// ユーザーを検索
	var user models.User
	if err := pc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ユーザーが見つかりませんでした"})
		return
	}

	// ユーザー情報を更新
	user.Name = req.Name
	user.Email = req.Email

	if err := pc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー情報の更新に失敗しました"})
		return
	}

	// トークンを生成 (auth/jwt.go の GenerateToken を使用)
	token, err := auth.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "トークンの生成に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// UpdateAvatar はユーザーのアバター画像を更新するエンドポイントです
//
// [PUT] /api/v1/users/:id/avatar
func (pc *ProfileController) UpdateAvatar(c *gin.Context) {
	// パスパラメータから userID を取得
	userID := c.Param("id")

	// ユーザーを検索
	var user models.User
	if err := pc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ユーザーが見つかりませんでした"})
		return
	}

	// form-data からファイルを取得
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "アバター画像が指定されていません"})
		return
	}

	// 保存先のパスを作成（ここでは "uploads" フォルダを使用）
	filename := fmt.Sprintf("%d_%s", user.ID, filepath.Base(file.Filename))
	savePath := filepath.Join("uploads", filename)

	// ファイルをサーバーに保存
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "アバター画像の保存に失敗しました"})
		return
	}

	// ユーザーの Avatar フィールドを更新（DB 上にはパス等を保存）
	user.Avatar = "/" + savePath
	if err := pc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー情報の更新に失敗しました"})
		return
	}

	// トークンを生成
	token, err := auth.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "トークンの生成に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

