package routes

import (
	"errors"  
	"net/http"
	"log"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm" 
)

func GetCoursesHandler(c *gin.Context) {
	var courses []models.Course
	if err := db.DB.Find(&courses).Error; err != nil {
		log.Printf("Error obteniendo cursos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron obtener los cursos"})
		return
	}
	log.Printf("Cursos encontrados: %d", len(courses))
	c.JSON(http.StatusOK, courses)
}

func GetCourseByIDHandler(c *gin.Context) {
    id := c.Param("id")
    var course models.Course  
    
    result := db.DB.
        Preload("Contents.Subcontents.Examples").
        First(&course, id)
    
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "Curso no encontrado"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }
    
    c.JSON(http.StatusOK, course)
}

func PostCourseHandler(c *gin.Context) {
	var input models.Course

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	// Validaciones básicas
	if input.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El título es requerido"})
		return
	}

	if input.Goto == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El campo goto es requerido"})
		return
	}

	log.Printf("Creando curso: %s", input.Title)

	if err := db.DB.Create(&input).Error; err != nil {
		log.Printf("Error creando curso: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al crear el curso: " + err.Error(),
			"details": err.Error(),
		})
		return
	}

	log.Printf("Curso creado con ID: %d", input.ID)
	c.JSON(http.StatusCreated, input)
}