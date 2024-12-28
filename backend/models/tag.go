package models

import "gorm.io/gorm"

type Tag struct {
	gorm.Model
	Name      string      `json:"name"`
	Documents []Document  `gorm:"many2many:document_tags;" json:"documents"`
}

