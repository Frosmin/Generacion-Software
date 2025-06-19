package main

import (
	"log"
	"net/http"

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
	// db.DB.AutoMigrate(models.User{})
	// db.DB.AutoMigrate(models.Exercise{})
	// db.DB.AutoMigrate(models.Tutorial{})
	// db.DB.AutoMigrate(models.Video{})

	// Obtener el router configurado con CORS y rutas
	r := routes.SetupRouter()

	// Configurar rutas adicionales
	http.HandleFunc("/", routes.Homehandler)
	http.HandleFunc("/verify", routes.VerificarPythonHandler)
	http.HandleFunc("/lsp", routes.LSPHandler)

	log.Println("Servidor escuchando en :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
