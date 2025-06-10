package main

import (
	"log"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/routes"

	_ "github.com/Frosmin/backend/docs" // ← Importación necesaria para Swagger
)

func main() {
	db.Connect()

	r := routes.SetupRouter() // El router ya incluye swagger

	log.Println("Servidor escuchando en :8080")
	log.Fatal(r.Run(":8080"))
}
