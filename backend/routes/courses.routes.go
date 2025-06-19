package routes

import (
	"errors"  
	"net/http"
	"log"
	"strconv"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm" 
)

// Estructura para recibir el JSON del frontend
type CourseRequest struct {
	Course   CourseInfo    `json:"course"`
	Contents []ContentInfo `json:"contents"`
}

type CourseInfo struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Goto        string `json:"goto"`
}

type ContentInfo struct {
	ID          uint            `json:"id"`
	Title       string          `json:"title"`
	Paragraph   []string        `json:"paragraph"`
	Subcontents []SubcontentInfo `json:"subcontents"`
}

type SubcontentInfo struct {
	Subtitle     string   `json:"subtitle"`
	Subparagraph []string `json:"subparagraph"`
	Example      []string `json:"example"`
}
type BasicCourseResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Goto        string `json:"goto"`
}


func GetBasicCourses(c *gin.Context) {
	var courses []models.Course
	
	// Solo seleccionar los campos que necesitamos, sin hacer Preload
	if err := db.DB.Select("id, title, description, goto").Find(&courses).Error; err != nil {
		log.Printf("Error fetching basic courses: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch courses",
		})
		return
	}

	// Convertir a formato de respuesta simple
	var responses []BasicCourseResponse
	
	for _, course := range courses {
		response := BasicCourseResponse{
			ID:          course.ID,
			Title:       course.Title,
			Description: course.Description,
			Goto:        course.Goto,
		}
		responses = append(responses, response)
	}

	c.JSON(http.StatusOK, responses)
}
// POST /courses - Crear un nuevo curso
func CreateCourse(c *gin.Context) {
	var courseRequest CourseRequest
	
	// Parsear el JSON del request
	if err := c.ShouldBindJSON(&courseRequest); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}

	// Crear el modelo Course
	course := models.Course{
		Title:       courseRequest.Course.Title,
		Description: courseRequest.Course.Description,
		Goto:        courseRequest.Course.Goto,
	}

	// Convertir Contents
	for _, contentInfo := range courseRequest.Contents {
		content := models.Content{
			Title:     contentInfo.Title,
			Paragraph: models.GormStrings(contentInfo.Paragraph),
		}

		// Convertir Subcontents
		for _, subcontentInfo := range contentInfo.Subcontents {
			subcontent := models.Subcontent{
				Subtitle:     subcontentInfo.Subtitle,
				Subparagraph: models.GormStrings(subcontentInfo.Subparagraph),
				Example:      models.GormStrings(subcontentInfo.Example),
			}
			content.Subcontents = append(content.Subcontents, subcontent)
		}

		course.Contents = append(course.Contents, content)
	}

	// Guardar en la base de datos
	if err := db.DB.Create(&course).Error; err != nil {
		log.Printf("Error creating course: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create course",
			"details": err.Error(),
		})
		return
	}

	// Respuesta exitosa
	c.JSON(http.StatusCreated, gin.H{
		"message": "Course created successfully",
		"course_id": course.ID,
	})
}

// GET /courses/:id - Obtener un curso por ID
func GetCourse(c *gin.Context) {
	courseID := c.Param("id")
	
	// Convertir string a uint
	id, err := strconv.ParseUint(courseID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid course ID",
		})
		return
	}

	var course models.Course
	
	// Buscar el curso con todas sus relaciones
	if err := db.DB.Preload("Contents.Subcontents").First(&course, uint(id)).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Course not found",
			})
			return
		}
		
		log.Printf("Error fetching course: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch course",
		})
		return
	}

	// Convertir a formato de respuesta
	response := CourseRequest{
		Course: CourseInfo{
			ID:          course.ID,
			Title:       course.Title,
			Description: course.Description,
			Goto:        course.Goto,
		},
		Contents: make([]ContentInfo, len(course.Contents)),
	}

	// Convertir Contents
	for i, content := range course.Contents {
		response.Contents[i] = ContentInfo{
			ID:          content.ID,
			Title:       content.Title,
			Paragraph:   []string(content.Paragraph),
			Subcontents: make([]SubcontentInfo, len(content.Subcontents)),
		}

		// Convertir Subcontents
		for j, subcontent := range content.Subcontents {
			response.Contents[i].Subcontents[j] = SubcontentInfo{
				Subtitle:     subcontent.Subtitle,
				Subparagraph: []string(subcontent.Subparagraph),
				Example:      []string(subcontent.Example),
			}
		}
	}

	c.JSON(http.StatusOK, response)
}

// GET /courses - Obtener todos los cursos (opcional)
func GetAllCourses(c *gin.Context) {
	var courses []models.Course
	
	// Buscar todos los cursos con sus relaciones
	if err := db.DB.Preload("Contents.Subcontents").Find(&courses).Error; err != nil {
		log.Printf("Error fetching courses: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch courses",
		})
		return
	}

	// Convertir a formato de respuesta
	var responses []CourseRequest
	
	for _, course := range courses {
		response := CourseRequest{
			Course: CourseInfo{
				ID:          course.ID,
				Title:       course.Title,
				Description: course.Description,
				Goto:        course.Goto,
			},
			Contents: make([]ContentInfo, len(course.Contents)),
		}

		// Convertir Contents
		for i, content := range course.Contents {
			response.Contents[i] = ContentInfo{
				ID:          content.ID,
				Title:       content.Title,
				Paragraph:   []string(content.Paragraph),
				Subcontents: make([]SubcontentInfo, len(content.Subcontents)),
			}

			// Convertir Subcontents
			for j, subcontent := range content.Subcontents {
				response.Contents[i].Subcontents[j] = SubcontentInfo{
					Subtitle:     subcontent.Subtitle,
					Subparagraph: []string(subcontent.Subparagraph),
					Example:      []string(subcontent.Example),
				}
			}
		}

		responses = append(responses, response)
	}

	c.JSON(http.StatusOK, responses)
}



