package db

import (
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DSN = "host=aws-0-sa-east-1.pooler.supabase.com user=postgres.lexwwxotwfsennaambio password=pepe dbname=postgres port=6543"

var DB *gorm.DB

func Connect() {
	var err error
	DB, err = gorm.Open(postgres.Open(DSN), &gorm.Config{
		PrepareStmt: false, // Deshabilitar la caché de prepared statements
	})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	} else {
		println("Connected to database")
	}

	// Configura el pool de conexiones
	sqlDB, err := DB.DB()
	if err != nil {
		panic("failed to get database connection: " + err.Error())
	}

	// Establece el número máximo de conexiones abiertas
	sqlDB.SetMaxOpenConns(10)

	// Establece el número máximo de conexiones inactivas
	sqlDB.SetMaxIdleConns(5)

	// Establece el tiempo máximo de vida de una conexión
	sqlDB.SetConnMaxLifetime(time.Hour)
}
