package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/swaggo/files" // swagger embed files
	"github.com/swaggo/gin-swagger"

	_ "github.com/Frosmin/backend/docs" 
)

// SetupRouter configura el enrutador con middleware CORS y todas las rutas necesarias
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Configuración de CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:4200"} // Tu aplicación Angular
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Ruta base
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Bienvenido a la API de Aprendizaje Python")
	})

	// Rutas de documentación Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Grupo de rutas de API
	api := r.Group("/api")

	// Rutas de usuario
	api.GET("/users", GetUsersHandler)
	api.GET("/user/:id", GetUserHandler)
	api.POST("/user", PostUserHandler)
	api.DELETE("/user/:id", DeleteUserHandler)

	// Rutas de video
	api.GET("/videos", GetVideosHandler)
	api.GET("/video/:id", GetVideoHandler)
	api.POST("/video", PostVideoHandler)
	api.GET("/videos20", GetVideosHandler20)

	// Rutas de Buscador
	api.GET("/search", SearchByNameHandler)
	return r
}
