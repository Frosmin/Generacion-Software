package models

import "gorm.io/gorm"

type Course struct {
	gorm.Model
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Goto        string         `gorm:"not null" json:"goto"`
	Contents    []CourseContent `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"contents"`
}

type CourseContent struct {
	gorm.Model
	CourseID     uint         `json:"course_id"`
	Title        string       `gorm:"not null" json:"title"`
	Paragraph    string       `gorm:"type:text" json:"paragraph"`
	Next         string       `json:"next"`
	Subcontents  []Subcontent `gorm:"foreignKey:CourseContentID;constraint:OnDelete:CASCADE" json:"subcontents"`
}

type Subcontent struct {
	gorm.Model
	CourseContentID uint      `json:"course_content_id"`
	Subtitle        string    `gorm:"not null" json:"subtitle"`
	Subparagraph    string    `gorm:"type:text" json:"subparagraph"`
	Examples        []Example `gorm:"foreignKey:SubcontentID;constraint:OnDelete:CASCADE" json:"examples"`
}

type Example struct {
	gorm.Model
	SubcontentID uint   `json:"subcontent_id"`
	Code         string `gorm:"type:text" json:"code"`
}