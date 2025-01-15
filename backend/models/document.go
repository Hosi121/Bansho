package models

import "gorm.io/gorm"

type Document struct {
	gorm.Model
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      []Tag     `gorm:"many2many:document_tags;" json:"tags"`
	EdgesFrom []Edge    `gorm:"foreignKey:FromDocumentID" json:"edges_from"`
	EdgesTo   []Edge    `gorm:"foreignKey:ToDocumentID" json:"edges_to"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user"`
}

