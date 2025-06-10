package models

// UserSwagger es el modelo de usuario usado para la documentación Swagger
type UserSwagger struct {
	ID        uint   `json:"id" example:"1"`
	Username  string `json:"username" example:"juan123"`
	FirstName string `json:"first_name" example:"Juan"`
	LastName  string `json:"last_name" example:"Pérez"`
	Email     string `json:"email" example:"juan@example.com"`
	Password  string `json:"password" example:"securepass"`
}
