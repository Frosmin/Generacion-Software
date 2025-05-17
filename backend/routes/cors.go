package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Configuración base
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Bienvenido a la API de Aprendizaje Python")
	})

	// Configurar rutas de API
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

	return r
}
