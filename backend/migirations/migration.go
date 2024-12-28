package migrations

import (
	"github.com/Hosi121/Bansho/config"
	"github.com/Hosi121/Bansho/models"
	"slog"
)

func RunMigrations() {
	err := config.DB.AutoMigrate(&models.User{}, &models.Document{}, &models.Tag{}, &models.Edge{})
	if err != nil {
		slog.Error("failed to run migrations", slog.String("error", err.Error()))
		return
	}
	slog.Info("database migrated successfully")
}

