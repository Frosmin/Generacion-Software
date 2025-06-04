package main

import (
	"log"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/Frosmin/backend/routes"
)

func main() {
	// migraciones para la base de datos
	db.Connect()

	db.DB.AutoMigrate(
		models.User{},
		models.Exercise{},
		models.Tutorial{},
		models.Video{},
	)

	// Obtener el router configurado con CORS y rutas
	r := routes.SetupRouter()

	// No es necesario configurar rutas aquí, ya están en SetupRouter()
	// ¡Elimina estas líneas!

	log.Println("Servidor escuchando en :8080")
	log.Fatal(r.Run(":8080"))
}
