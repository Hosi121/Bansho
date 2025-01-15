package controllers

import (
	"net/http"

	"github.com/Hosi121/Bansho/config"
	"github.com/Hosi121/Bansho/models"
	"golang.org/x/exp/slog"
	"github.com/gin-gonic/gin"
)

// GetDocuments - ドキュメント一覧を取得する
func GetDocuments(c *gin.Context) {
	var documents []models.Document
	if err := config.DB.Preload("Tags").Preload("EdgesFrom").Preload("EdgesTo").Find(&documents).Error; err != nil {
		slog.Error("failed to fetch documents", slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch documents"})
		return
	}

	slog.Info("fetched documents successfully", slog.Int("count", len(documents)))
	c.JSON(http.StatusOK, documents)
}

// GetDocumentByID - 特定のドキュメントを取得する
func GetDocumentByID(c *gin.Context) {
	id := c.Param("id")
	var document models.Document
	if err := config.DB.Preload("Tags").Preload("EdgesFrom").Preload("EdgesTo").First(&document, id).Error; err != nil {
		slog.Error("document not found", slog.String("error", err.Error()), slog.String("id", id))
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	slog.Info("fetched document successfully", slog.String("id", id))
	c.JSON(http.StatusOK, document)
}

// CreateDocument - 新しいドキュメントを作成する
func CreateDocument(c *gin.Context) {
	var document models.Document
	if err := c.ShouldBindJSON(&document); err != nil {
		slog.Error("failed to bind JSON", slog.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	if err := config.DB.Create(&document).Error; err != nil {
		slog.Error("failed to create document", slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create document"})
		return
	}

	slog.Info("created document successfully", slog.String("title", document.Title))
	c.JSON(http.StatusCreated, document)
}

// UpdateDocument - ドキュメントを更新する
func UpdateDocument(c *gin.Context) {
	id := c.Param("id")
	var document models.Document
	if err := config.DB.First(&document, id).Error; err != nil {
		slog.Error("document not found for update", slog.String("error", err.Error()), slog.String("id", id))
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	var updatedData models.Document
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		slog.Error("failed to bind JSON for update", slog.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	if err := config.DB.Model(&document).Updates(updatedData).Error; err != nil {
		slog.Error("failed to update document", slog.String("error", err.Error()), slog.String("id", id))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update document"})
		return
	}

	slog.Info("updated document successfully", slog.String("id", id))
	c.JSON(http.StatusOK, document)
}

// DeleteDocument - ドキュメントを削除する
func DeleteDocument(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Document{}, id).Error; err != nil {
		slog.Error("failed to delete document", slog.String("error", err.Error()), slog.String("id", id))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete document"})
		return
	}

	slog.Info("deleted document successfully", slog.String("id", id))
	c.JSON(http.StatusOK, gin.H{"message": "document deleted successfully"})
}

