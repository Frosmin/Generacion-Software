package routes

import (
	"net/http"
	"strings"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

// SearchResult agrupa los resultados posibles usando modelos Swagger
type SearchResult struct {
	Videos    []models.VideoSwagger    `json:"videos,omitempty"`
	Exercises []models.ExerciseSwagger `json:"exercises,omitempty"`
	Tutorials []models.TutorialSwagger `json:"tutorials,omitempty"`
}

// SearchByNameHandler godoc
// @Summary Buscar por nombre en videos, ejercicios y tutoriales
// @Description Busca coincidencias en videos, ejercicios y tutoriales por nombre parcial (case insensitive)
// @Tags search
// @Produce json
// @Param name query string true "Nombre para búsqueda"
// @Success 200 {object} SearchResult
// @Failure 400 {object} models.ErrorResponse
// @Router /api/search [get]
func SearchByNameHandler(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El parámetro 'name' es obligatorio"})
		return
	}

	nameLike := "%" + strings.ToLower(name) + "%"

	var videos []models.Video
	var exercises []models.Exercise
	var tutorials []models.Tutorial

	// Buscamos títulos en minúsculas para que sea case insensitive
	db.DB.Where("LOWER(title) LIKE ?", nameLike).Find(&videos)
	db.DB.Where("LOWER(title) LIKE ?", nameLike).Find(&exercises)
	db.DB.Where("LOWER(title) LIKE ?", nameLike).Find(&tutorials)

	// Convertimos a los modelos Swagger para la respuesta
	var videosSwagger []models.VideoSwagger
	for _, v := range videos {
		videosSwagger = append(videosSwagger, models.VideoSwagger{
			ID:    v.ID,
			Title: v.Title,
			Link:  v.Link,
			Level: v.Level,
		})
	}

	var exercisesSwagger []models.ExerciseSwagger
	for _, e := range exercises {
		exercisesSwagger = append(exercisesSwagger, models.ExerciseSwagger{
			ID:       e.ID,
			Title:    e.Title,
			Exercise: e.Exercise,
			Solution: e.Solution,
			Level:    e.Level,
		})
	}

	var tutorialsSwagger []models.TutorialSwagger
	for _, t := range tutorials {
		tutorialsSwagger = append(tutorialsSwagger, models.TutorialSwagger{
			ID:          t.ID,
			Title:       t.Title,
			Description: t.Description,
			Level:       t.Level,
		})
	}

	c.JSON(http.StatusOK, SearchResult{
		Videos:    videosSwagger,
		Exercises: exercisesSwagger,
		Tutorials: tutorialsSwagger,
	})
}
