package main

import (
	"log/slog"
	"os"

	"github.com/Hosi121/Bansho/config"
	"github.com/Hosi121/Bansho/middlewares"
	"github.com/Hosi121/Bansho/migrations"
	"github.com/Hosi121/Bansho/prompt"
	"github.com/Hosi121/Bansho/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Slog のデフォルトロガーを設定
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	// データベース接続
	config.ConnectDB()

	// マイグレーション実行
	migrations.RunMigrations()

	// プロンプトファイルの検証
	prompt.ValidatePromptFile("relation_prompt.json")

	// 環境変数のロード
	err := godotenv.Load()
	if err != nil {
		slog.Warn("No .env file found (this is expected in Cloud Run)")
	}

	db := config.DB
	if db == nil {
		slog.Error("failed to initialize database, config.DB is nil")
		return
	}

	// Gin のモード設定
	gin.SetMode(gin.DebugMode)

	// Ginエンジンを作成
	r := gin.Default()

	// CORSミドルウェアを適用
	r.Use(middlewares.CORSMiddleware())

	// ここでルーティング設定を適用
	routes.SetupRoutes(r, db)

	// ポート番号を取得
	port := "8080"

	slog.Info("starting server", slog.String("port", port))
	if err := r.Run(":" + port); err != nil {
		slog.Error("failed to start server", slog.String("error", err.Error()))
	}
}
