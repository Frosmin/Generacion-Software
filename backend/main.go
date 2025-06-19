package main

import (
	"log"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/routes"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("Archivo .env no encontrado, usando variables de entorno del sistema")
	}
	// migraciones para la base de datos
	db.Connect()
	db.DB.AutoMigrate(models.User{})
	db.DB.AutoMigrate(models.Exercise{})
	db.DB.AutoMigrate(models.Tutorial{})
	db.DB.AutoMigrate(models.Video{})
	db.DB.AutoMigrate(models.Course{})
	db.DB.AutoMigrate(models.Subcontent{})
	db.DB.AutoMigrate(models.Example{})

	// Obtener el router configurado con CORS y rutas
	r := routes.SetupRouter()

	// No es necesario configurar rutas aquí, ya están en SetupRouter()
	// ¡Elimina estas líneas!

	log.Println("Servidor escuchando en :8080")
	log.Fatal(r.Run(":8080"))
}
