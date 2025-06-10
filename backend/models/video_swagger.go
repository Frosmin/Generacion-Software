package models

type VideoSwagger struct {
	ID    uint   `json:"id" example:"1"`
	Title string `json:"title" example:"Aprende Go en 10 minutos"`
	Link  string `json:"link" example:"https://youtube.com/example"`
	Level int    `json:"level" example:"2"`
}
