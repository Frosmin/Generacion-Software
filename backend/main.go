package main

import (
	"log"

	"github.com/Frosmin/backend/db"
	docs "github.com/Frosmin/backend/docs" // Importación explícita
	"github.com/Frosmin/backend/routes"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title API de Aprendizaje Python
// @version 1.0
// @description API para la plataforma de enseñanza de programación en Python
// @host localhost:8080
// @BasePath /api
func main() {
	// Configura Swagger
	docs.SwaggerInfo.BasePath = "/api"
	docs.SwaggerInfo.Host = "localhost:8080"
	docs.SwaggerInfo.Title = "API de Aprendizaje Python"
	docs.SwaggerInfo.Description = "API para la plataforma de enseñanza de programación en Python"
	docs.SwaggerInfo.Version = "1.0"

	// migraciones para la base de datos
	db.Connect()
	// db.DB.AutoMigrate(models.User{})
	// db.DB.AutoMigrate(models.Exercise{})
	// db.DB.AutoMigrate(models.Tutorial{})
	// db.DB.AutoMigrate(models.Video{})

	// Obtener el router configurado con CORS y rutas
	r := routes.SetupRouter()

	// Añadir ruta de Swagger (opcional si ya está en SetupRouter)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Println("Servidor escuchando en :8080")
	log.Println("Documentación Swagger disponible en: http://localhost:8080/swagger/index.html")
	log.Fatal(r.Run(":8080"))
}
