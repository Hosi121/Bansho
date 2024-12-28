package config

import (
	"fmt"
	"log"
	"os"

	"log/slog"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// .env ファイルの読み込み
	err := godotenv.Load()
	if err != nil {
		slog.Warn("No .env file found, using system environment variables")
	}

	// DSNを生成
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// DSN をデバッグログに出力
	log.Printf("Generated DSN: %s", dsn)

	// GORMでDB接続
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		slog.Error("failed to connect to database", slog.String("error", err.Error()))
		log.Fatalf("Error connecting to database: %v", err)
	}

	slog.Info("database connected successfully", slog.String("host", os.Getenv("DB_HOST")))
	log.Println("Database connection established successfully.")
}
