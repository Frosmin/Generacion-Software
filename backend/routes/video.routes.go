package routes

import (
	"net/http"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

// GetVideosHandler godoc
// @Summary Lista todos los videos
// @Description Obtiene todos los videos disponibles
// @Tags videos
// @Produce json
// @Success 200 {array} models.VideoSwagger
// @Router /api/videos [get]
func GetVideosHandler(c *gin.Context) {
	var videos []models.Video
	db.DB.Find(&videos)
	c.JSON(http.StatusOK, videos)
}

// GetVideoHandler godoc
// @Summary Obtiene un video por ID
// @Description Retorna un video específico por ID
// @Tags videos
// @Produce json
// @Param id path int true "ID del video"
// @Success 200 {object} models.VideoSwagger
// @Failure 404 {object} models.ErrorResponse
// @Router /api/video/{id} [get]
func GetVideoHandler(c *gin.Context) {
	id := c.Param("id")
	var video models.Video
	db.DB.First(&video, id)

	if video.ID == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "video no encontrado"})
		return
	}

	c.JSON(http.StatusOK, video)
}

// GetVideosHandler20 godoc
// @Summary Lista hasta 20 videos
// @Description Obtiene un máximo de 20 videos
// @Tags videos
// @Produce json
// @Success 200 {array} models.VideoSwagger
// @Router /api/videos20 [get]
func GetVideosHandler20(c *gin.Context) {
	var videos []models.Video
	db.DB.Limit(20).Find(&videos)
	c.JSON(http.StatusOK, videos)
}

// PostVideoHandler godoc
// @Summary Crea un nuevo video
// @Description Guarda un nuevo registro de video
// @Tags videos
// @Accept json
// @Produce json
// @Param video body models.Video true "Datos del video"
// @Success 201 {object} models.VideoSwagger
// @Failure 400 {object} models.ErrorResponse
// @Router /api/video [post]
func PostVideoHandler(c *gin.Context) {
	var video models.Video

	if err := c.ShouldBindJSON(&video); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "video no creado"})
		return
	}
	db.DB.Create(&video)
	c.JSON(http.StatusCreated, video)
}
