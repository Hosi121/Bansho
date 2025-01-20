package models

import "gorm.io/gorm"

// User represents the users table in the DB.
type User struct {
	gorm.Model
	ID           uint       `gorm:"primaryKey" json:"id"`
	Email        string     `gorm:"unique;not null" json:"email"`
	Name         string     `json:"name"`
	Avatar       string     `json:"avatar"`
	PasswordHash string     `json:"-"` // never return password hash
	Document     []Document `json:"documents"`
}
