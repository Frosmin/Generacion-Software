package models

type TutorialSwagger struct {
	ID          uint   `json:"id" example:"1"`
	Title       string `json:"title" example:"Introducción a Python"`
	Description string `json:"description" example:"Un curso básico para empezar con Python"`
	Level       int    `json:"level" example:"1"`
}
