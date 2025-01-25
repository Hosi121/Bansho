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

	// 環境変数からDB接続情報を取得 (Private IPの場合)
	dbHost := os.Getenv("DB_HOST")     // 例: 10.123.45.67
	dbPort := os.Getenv("DB_PORT")     // 例: 5432
	dbUser := os.Getenv("DB_USER")     // 例: postgres
	dbPass := os.Getenv("DB_PASSWORD") // 例: xxxxx
	dbName := os.Getenv("DB_NAME")     // 例: bansho

	// DSNを生成 (host + port + user + password + dbname)
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Tokyo",
		dbHost,
		dbPort,
		dbUser,
		dbPass,
		dbName,
	)

	// DSN をログに出力
	log.Printf("Generated DSN: %s", dsn)

	// GORMでDB接続
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		slog.Error("failed to connect to database", slog.String("error", err.Error()))
		log.Fatalf("Error connecting to database: %v", err)
	}

	slog.Info("database connected successfully", slog.String("host", dbHost))
	log.Println("Database connection established successfully.")
}
