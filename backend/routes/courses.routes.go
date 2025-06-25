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
	ID                     uint              `json:"id"`
	Title                  string            `json:"title"`
	Paragraph              []string          `json:"paragraph"`
	Subcontent             []SubcontentInfo  `json:"subcontent"` 
	Next                   *string           `json:"next"`
	MaxResourceConsumption int               `json:"maxResourceConsumption"`
	MaxProcessingTime      int               `json:"maxProcessingTime"`
}

type SubcontentInfo struct {
	Subtitle     string        `json:"subtitle"`
	Subparagraph []string      `json:"subparagraph"`
	Example      []ExampleInfo `json:"example"`
}

type ExampleInfo struct {
	Code string `json:"code"`
}

type BasicCourseResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Goto        string `json:"goto"`
}

// Helper function to convert *string to string
func ptrStringToString(ptr *string) string {
	if ptr == nil {
		return ""
	}
	return *ptr
}

// Helper function to convert string to *string
func stringToPtrString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func GetBasicCourses(c *gin.Context) {
	var courses []models.Course
	if err := db.DB.Select("id, title, description, goto").Find(&courses).Error; err != nil {
		log.Printf("Error fetching basic courses: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch courses",
		})
		return
	}
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

func CreateCourse(c *gin.Context) {
	var courseRequest CourseRequest
	if err := c.ShouldBindJSON(&courseRequest); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}
	
	// Crear curso sin ID (para que GORM genere uno nuevo)
	course := models.Course{
		Title:       courseRequest.Course.Title,
		Description: courseRequest.Course.Description,
		Goto:        courseRequest.Course.Goto,
	}
	
	for _, contentInfo := range courseRequest.Contents {
		// Crear contenido sin ID (para que GORM genere uno nuevo)
		content := models.Content{
			Title:                  contentInfo.Title,
			Paragraph:              models.GormStrings(contentInfo.Paragraph),
			Next:                   ptrStringToString(contentInfo.Next),
			MaxResourceConsumption: contentInfo.MaxResourceConsumption,
			MaxProcessingTime:      contentInfo.MaxProcessingTime,
		}
		
		for _, subcontentInfo := range contentInfo.Subcontent {
			var exampleStrings []string
			for _, example := range subcontentInfo.Example {
				exampleStrings = append(exampleStrings, example.Code)
			}
			
			// Crear subcontenido sin ID (para que GORM genere uno nuevo)
			subcontent := models.Subcontent{
				Subtitle:     subcontentInfo.Subtitle,
				Subparagraph: models.GormStrings(subcontentInfo.Subparagraph),
				Example:      models.GormStrings(exampleStrings),
			}
			content.Subcontent = append(content.Subcontent, subcontent)
		}
		course.Contents = append(course.Contents, content)
	}
	
	if err := db.DB.Create(&course).Error; err != nil {
		log.Printf("Error creating course: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create course",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"message": "Course created successfully",
		"course_id": course.ID,
	})
}

func GetCourse(c *gin.Context) {
	courseID := c.Param("id")
	id, err := strconv.ParseUint(courseID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid course ID",
		})
		return
	}
	var course models.Course
	if err := db.DB.Preload("Contents.Subcontent").First(&course, uint(id)).Error; err != nil {
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
	response := CourseRequest{
		Course: CourseInfo{
			ID:          course.ID,
			Title:       course.Title,
			Description: course.Description,
			Goto:        course.Goto,
		},
		Contents: make([]ContentInfo, len(course.Contents)),
	}
	for i, content := range course.Contents {
		response.Contents[i] = ContentInfo{
			ID:                     content.ID,
			Title:                  content.Title,
			Paragraph:              []string(content.Paragraph),
			Subcontent:             make([]SubcontentInfo, len(content.Subcontent)),
			Next:                   stringToPtrString(content.Next),
			MaxResourceConsumption: content.MaxResourceConsumption,
			MaxProcessingTime:      content.MaxProcessingTime,
		}
		for j, subcontent := range content.Subcontent {
			var examples []ExampleInfo
			for _, exampleStr := range []string(subcontent.Example) {
				examples = append(examples, ExampleInfo{Code: exampleStr})
			}
			
			response.Contents[i].Subcontent[j] = SubcontentInfo{
				Subtitle:     subcontent.Subtitle,
				Subparagraph: []string(subcontent.Subparagraph),
				Example:      examples,
			}
		}
	}
	c.JSON(http.StatusOK, response)
}

func GetAllCourses(c *gin.Context) {
	var courses []models.Course
	if err := db.DB.Preload("Contents.Subcontent").Find(&courses).Error; err != nil {
		log.Printf("Error fetching courses: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch courses",
		})
		return
	}
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
		for i, content := range course.Contents {
			response.Contents[i] = ContentInfo{
				ID:                     content.ID,
				Title:                  content.Title,
				Paragraph:              []string(content.Paragraph),
				Subcontent:             make([]SubcontentInfo, len(content.Subcontent)),
				Next:                   stringToPtrString(content.Next),
				MaxResourceConsumption: content.MaxResourceConsumption,
				MaxProcessingTime:      content.MaxProcessingTime,
			}
			for j, subcontent := range content.Subcontent {
				var examples []ExampleInfo
				for _, exampleStr := range []string(subcontent.Example) {
					examples = append(examples, ExampleInfo{Code: exampleStr})
				}
				
				response.Contents[i].Subcontent[j] = SubcontentInfo{
					Subtitle:     subcontent.Subtitle,
					Subparagraph: []string(subcontent.Subparagraph),
					Example:      examples,
				}
			}
		}
		responses = append(responses, response)
	}
	c.JSON(http.StatusOK, responses)
}

// FUNCIÓN UPDATECOURSE CORREGIDA
func UpdateCourse(c *gin.Context) {
	courseID := c.Param("id")
	id, err := strconv.ParseUint(courseID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid course ID",
		})
		return
	}

	var courseRequest CourseRequest
	if err := c.ShouldBindJSON(&courseRequest); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}

	// Verificar que el curso existe
	var existingCourse models.Course
	if err := db.DB.First(&existingCourse, uint(id)).Error; err != nil {
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

	// Usar transacción para asegurar consistencia
	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Actualizar información básica del curso
	existingCourse.Title = courseRequest.Course.Title
	existingCourse.Description = courseRequest.Course.Description
	existingCourse.Goto = courseRequest.Course.Goto

	if err := tx.Save(&existingCourse).Error; err != nil {
		tx.Rollback()
		log.Printf("Error updating course: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update course",
			"details": err.Error(),
		})
		return
	}

	// PASO 1: Eliminar todos los subcontenidos existentes
	if err := tx.Where("content_id IN (?)",
		tx.Model(&models.Content{}).Select("id").Where("course_id = ?", existingCourse.ID),
	).Delete(&models.Subcontent{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting subcontents: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete subcontents",
			"details": err.Error(),
		})
		return
	}

	// PASO 2: Eliminar todos los contenidos existentes
	if err := tx.Where("course_id = ?", existingCourse.ID).Delete(&models.Content{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting contents: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete contents",
			"details": err.Error(),
		})
		return
	}

	// PASO 3: Crear los nuevos contenidos (SIN especificar IDs)
	for _, contentInfo := range courseRequest.Contents {
		// IMPORTANTE: No establecer ID para que GORM genere uno nuevo
		content := models.Content{
			// ID se omite intencionalmente para que GORM genere uno nuevo
			Title:                  contentInfo.Title,
			Paragraph:              models.GormStrings(contentInfo.Paragraph),
			Next:                   ptrStringToString(contentInfo.Next),
			MaxResourceConsumption: contentInfo.MaxResourceConsumption,
			MaxProcessingTime:      contentInfo.MaxProcessingTime,
			CourseID:               existingCourse.ID,
		}

		for _, subcontentInfo := range contentInfo.Subcontent {
			var exampleStrings []string
			for _, example := range subcontentInfo.Example {
				exampleStrings = append(exampleStrings, example.Code)
			}
			
			// IMPORTANTE: No establecer ID para que GORM genere uno nuevo
			subcontent := models.Subcontent{
				// ID se omite intencionalmente para que GORM genere uno nuevo
				// ContentID se establecerá automáticamente por GORM
				Subtitle:     subcontentInfo.Subtitle,
				Subparagraph: models.GormStrings(subcontentInfo.Subparagraph),
				Example:      models.GormStrings(exampleStrings),
			}
			content.Subcontent = append(content.Subcontent, subcontent)
		}
		
		if err := tx.Create(&content).Error; err != nil {
			tx.Rollback()
			log.Printf("Error creating content: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create course content",
				"details": err.Error(),
			})
			return
		}
	}

	// Confirmar transacción
	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update course",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Course updated successfully",
		"course_id": existingCourse.ID,
	})
}

func DeleteCourse(c *gin.Context) {
	courseID := c.Param("id")
	id, err := strconv.ParseUint(courseID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid course ID",
		})
		return
	}

	// Verificar que el curso existe
	var course models.Course
	if err := db.DB.First(&course, uint(id)).Error; err != nil {
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

	// Usar transacción para eliminar en cascada
	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Eliminar subcontenidos
	if err := tx.Where("content_id IN (?)",
		tx.Model(&models.Content{}).Select("id").Where("course_id = ?", course.ID),
	).Delete(&models.Subcontent{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting subcontents: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete subcontents",
		})
		return
	}

	// Eliminar contenidos
	if err := tx.Where("course_id = ?", course.ID).Delete(&models.Content{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting contents: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete contents",
		})
		return
	}

	// Eliminar curso
	if err := tx.Delete(&course).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting course: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete course",
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing delete transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete course",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Course deleted successfully",
	})
}

func GetCourseIDByGoto(c *gin.Context) {
    gotoParam := c.Param("goto") 

    var course models.Course
    if err := db.DB.Select("id").Where("goto = ?", gotoParam).First(&course).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{
                "error": "Course with given Goto not found",
            })
            return
        }
        log.Printf("Error fetching course by Goto: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch course by Goto",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "id": course.ID,
    })
}
