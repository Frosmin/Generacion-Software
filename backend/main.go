package main

import (
	"log"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/routes"
)

func main() {
	// migraciones para la base de datos
	db.Connect()

	// Cerrar la conexión cuando termine la aplicación
	sqlDB, err := db.DB.DB()
	if err != nil {
		log.Fatalf("Error al obtener la conexión SQL: %v", err)
	}
	defer sqlDB.Close()

	// db.DB.AutoMigrate(models.User{})
	// db.DB.AutoMigrate(models.Exercise{})
	// db.DB.AutoMigrate(models.Tutorial{})
	// db.DB.AutoMigrate(models.Video{})

	// Obtener el router configurado con CORS y rutas
	r := routes.SetupRouter()

	log.Println("Servidor escuchando en :8080")
	log.Fatal(r.Run(":8080"))
}
