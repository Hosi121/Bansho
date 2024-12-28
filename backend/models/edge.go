package models

import "gorm.io/gorm"

type Edge struct {
	gorm.Model
	FromDocumentID uint      `json:"from_document_id"`
	FromDocument   Document  `gorm:"foreignKey:FromDocumentID" json:"from_document"`
	ToDocumentID   uint      `json:"to_document_id"`
	ToDocument     Document  `gorm:"foreignKey:ToDocumentID" json:"to_document"`
	Weight         float64   `json:"weight"`
}

