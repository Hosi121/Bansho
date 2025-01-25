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

	// インスタンス接続名とその他情報を環境変数から取得
	instanceConnName := os.Getenv("DB_INSTANCE_CONNECTION_NAME")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Cloud SQL Unix ソケット用 DSN
	dsn := fmt.Sprintf(
		"host=/cloudsql/%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Tokyo",
		instanceConnName,
		dbUser,
		dbPass,
		dbName,
	)

	// DSN をログに出力（パスワードは実運用で見えないようにするか注意）
	log.Printf("Generated DSN: %s", dsn)

	// GORM で DB 接続
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		slog.Error("failed to connect to database", slog.String("error", err.Error()))
		log.Fatalf("Error connecting to database: %v", err)
	}

	slog.Info("database connected successfully",
		slog.String("instance_connection_name", instanceConnName),
	)
	log.Println("Database connection established successfully.")
}
