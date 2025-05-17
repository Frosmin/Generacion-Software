package routes

import (
	"net/http"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

// GetVideosHandler godoc
// @Summary Obtener todos los videos
// @Description Retorna una lista de todos los videos disponibles
// @Tags videos
// @Accept json
// @Produce json
// @Success 200 {array} models.Video
// @Router /videos [get]
func GetVideosHandler(c *gin.Context) {
	var videos []models.Video
	db.DB.Find(&videos)
	c.JSON(http.StatusOK, videos)
}

// GetVideoHandler godoc
// @Summary Obtener un video por ID
// @Description Retorna un video específico por su ID
// @Tags videos
// @Accept json
// @Produce json
// @Param id path string true "ID del video"
// @Success 200 {object} models.Video
// @Failure 404 {object} map[string]string "error"
// @Router /video/{id} [get]
func GetVideoHandler(c *gin.Context) {
	id := c.Param("id")
	var video models.Video
	db.DB.First(&video, id)

	if video.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "video no encontrado"})
		return
	}

	c.JSON(http.StatusOK, video)
}

// GetVideosHandler20 godoc
// @Summary Obtener 20 videos
// @Description Retorna los primeros 20 videos disponibles
// @Tags videos
// @Accept json
// @Produce json
// @Success 200 {array} models.Video
// @Router /videos20 [get]
func GetVideosHandler20(c *gin.Context) {
	var videos []models.Video
	db.DB.Limit(20).Find(&videos)
	c.JSON(http.StatusOK, videos)
}

// PostVideoHandler godoc
// @Summary Crear un nuevo video
// @Description Crea un nuevo registro de video
// @Tags videos
// @Accept json
// @Produce json
// @Param video body models.Video true "Datos del video"
// @Success 201 {object} models.Video
// @Failure 400 {object} map[string]string "error"
// @Router /video [post]
func PostVideoHandler(c *gin.Context) {
	var video models.Video

	var error = c.ShouldBindJSON(&video)
	if error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video no creado"})
		return
	}
	db.DB.Create(&video)
	c.JSON(http.StatusCreated, video)
}
