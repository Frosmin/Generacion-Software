package models

import "gorm.io/gorm"

type Video struct {
	gorm.Model
	Title string `gorm:"unique;not null"`
	Link  string
	Level int
}
