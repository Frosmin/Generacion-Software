package docs

import "time"

// Base representa los campos base de los modelos para Swagger
type Base struct {
	ID        uint       `json:"id" example:"1"`
	CreatedAt time.Time  `json:"created_at" example:"2025-05-16T23:47:14Z"`
	UpdatedAt time.Time  `json:"updated_at" example:"2025-05-16T23:47:14Z"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" example:"null"`
}

// User representa un usuario para la documentación de Swagger
type User struct {
	Base
	Username  string `json:"username" example:"usuario123"`
	FirstName string `json:"firstName" example:"Juan"`
	LastName  string `json:"lastName" example:"Pérez"`
	Email     string `json:"email" example:"juan@example.com"`
	Password  string `json:"password" example:"contraseña123"`
}

// Video representa un video para la documentación de Swagger
type Video struct {
	Base
	Title string `json:"title" example:"Introducción a Python"`
	Link  string `json:"link" example:"https://www.youtube.com/embed/dQw4w9WgXcQ"`
	Level int    `json:"level" example:"1"`
}

// Exercise representa un ejercicio para la documentación de Swagger
type Exercise struct {
	Base
	Title    string `json:"title" example:"Ejercicio de bucles"`
	Exercise string `json:"exercise" example:"Escribir un programa que imprima los números del 1 al 10"`
	Solution string `json:"solution" example:"for i in range(1, 11): print(i)"`
	Level    int    `json:"level" example:"1"`
}

// Tutorial representa un tutorial para la documentación de Swagger
type Tutorial struct {
	Base
	Title       string `json:"title" example:"Tutorial de Python"`
	Description string `json:"description" example:"Aprende los fundamentos de Python"`
	Level       int    `json:"level" example:"1"`
}
