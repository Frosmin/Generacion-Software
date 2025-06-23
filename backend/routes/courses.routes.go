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
	ID         uint              `json:"id"`
	Title      string            `json:"title"`
	Paragraph  []string          `json:"paragraph"`
	Subcontent []SubcontentInfo  `json:"subcontent"` 
	Next       string            `json:"next,omitempty"`
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
	course := models.Course{
		Title:       courseRequest.Course.Title,
		Description: courseRequest.Course.Description,
		Goto:        courseRequest.Course.Goto,
	}
	for _, contentInfo := range courseRequest.Contents {
		content := models.Content{
			Title:     contentInfo.Title,
			Paragraph: models.GormStrings(contentInfo.Paragraph),
			Next:      contentInfo.Next,
		}
		for _, subcontentInfo := range contentInfo.Subcontent {
			subcontent := models.Subcontent{
				Subtitle:     subcontentInfo.Subtitle,
				Subparagraph: models.GormStrings(subcontentInfo.Subparagraph),
				Example:      models.GormStrings(subcontentInfo.Example),
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
			ID:          content.ID,
			Title:       content.Title,
			Paragraph:   []string(content.Paragraph),
			Subcontent:  make([]SubcontentInfo, len(content.Subcontent)),
			Next:        content.Next,
		}
		for j, subcontent := range content.Subcontent {
			response.Contents[i].Subcontent[j] = SubcontentInfo{
				Subtitle:     subcontent.Subtitle,
				Subparagraph: []string(subcontent.Subparagraph),
				Example:      []string(subcontent.Example),
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
				ID:          content.ID,
				Title:       content.Title,
				Paragraph:   []string(content.Paragraph),
				Subcontent:  make([]SubcontentInfo, len(content.Subcontent)),
				Next:        content.Next,
			}
			for j, subcontent := range content.Subcontent {
				response.Contents[i].Subcontent[j] = SubcontentInfo{
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
