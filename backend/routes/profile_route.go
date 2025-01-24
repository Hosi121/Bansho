package routes

import (
    "github.com/Hosi121/Bansho/controllers"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// ProfileRoutes sets up profile-related endpoints under the specified router group.
func ProfileRoutes(db *gorm.DB, router *gin.RouterGroup) {
    profileController := controllers.NewProfileController(db)

    // プロフィール情報の更新
    router.PUT("/users/:id", profileController.UpdateProfile)
    // アバター画像の更新
    router.PUT("/users/:id/avatar", profileController.UpdateAvatar)
}

