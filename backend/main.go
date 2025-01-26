package main

import (
	"os"

	"log/slog"

	"github.com/Hosi121/Bansho/config"
	"github.com/Hosi121/Bansho/migrations"
	"github.com/Hosi121/Bansho/prompt"
	"github.com/Hosi121/Bansho/routes"
	"github.com/joho/godotenv"
)

func main() {
	// Slogのデフォルトロガーを設定
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	// データベース接続 (config.DB に *gorm.DB がセットされる想定)
	config.ConnectDB()

	// マイグレーション実行
	migrations.RunMigrations()

	// プロンプトファイルの検証
	prompt.ValidatePromptFile("relation_prompt.json")

	// ルート設定

	err := godotenv.Load()
	if err != nil {
		slog.Warn("No .env file found (this is expected in Cloud Run)")
	}

	// config.DB が nil でないかを確認しつつ、routes.SetupRoutes へ渡す
	db := config.DB
	if db == nil {
		slog.Error("failed to initialize database, config.DB is nil")
		return
	}
	r := routes.SetupRoutes(db)

	// ポート番号を環境変数から取得
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		slog.Warn("PORT environment variable not set, defaulting to 8080")
	}

	slog.Info("starting server", slog.String("port", port))
	if err := r.Run(":" + port); err != nil {
		slog.Error("failed to start server", slog.String("error", err.Error()))
	}
}
