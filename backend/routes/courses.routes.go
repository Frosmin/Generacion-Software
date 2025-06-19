package routes

import (
	"net/http"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

func GetCursosHandler(c *gin.Context) {
	var cursos []models.Course
	err := db.DB.Preload("Subcontent.Examples").Find(&cursos).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener cursos"})
		return
	}
	c.JSON(http.StatusOK, cursos)
}

func PostCursoHandler(c *gin.Context) {
	var curso models.Course
	if err := c.ShouldBindJSON(&curso); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Curso no válido"})
		return
	}

	err := db.DB.Create(&curso).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo guardar el curso"})
		return
	}

	c.JSON(http.StatusCreated, curso)
}
