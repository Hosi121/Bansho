package main

import (
	"os"

	"log/slog"

	"github.com/Hosi121/Bansho/config"
	"github.com/Hosi121/Bansho/migrations"
	"github.com/Hosi121/Bansho/routes"
)

// @title Bansho API
// @version 1.0
// @description Bansho API for document management and visualization.
// @host localhost:8080
// @BasePath /api/v1
func main() {
	// Slogのデフォルトロガーを設定
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout)))

	// データベース接続
	config.ConnectDB()

	// マイグレーション実行
	migrations.RunMigrations()

	// ルート設定
	r := routes.SetupRoutes()

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
