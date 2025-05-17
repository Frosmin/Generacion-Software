package main

import (
	"log"

	"github.com/Frosmin/backend/db"
	_ "github.com/Frosmin/backend/docs"
	"github.com/Frosmin/backend/routes"
)

// @title API de Aprendizaje Python
// @version 1.0
// @description API para la plataforma de enseñanza de programación en Python
// @host localhost:8080
// @BasePath /api
func main() {
	// migraciones para la base de datos
	db.Connect()
	// db.DB.AutoMigrate(models.User{})
	// db.DB.AutoMigrate(models.Exercise{})
	// db.DB.AutoMigrate(models.Tutorial{})
	// db.DB.AutoMigrate(models.Video{})

	// Obtener el router configurado con CORS y rutas
	r := routes.SetupRouter()

	log.Println("Servidor escuchando en :8080")
	log.Fatal(r.Run(":8080"))
}
