package models

import "gorm.io/gorm"

type Course struct {
    gorm.Model
    Title     string       `gorm:"not null"`
    Paragraph string       `gorm:"type:text"`
    Subcontent []Subcontent `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE"`
    Next      string
}

type Subcontent struct {
    gorm.Model
    CourseID     uint
    Subtitle     string       `gorm:"not null"`
    Subparagraph string       `gorm:"type:text"`
    Examples     []Example    `gorm:"foreignKey:SubcontentID;constraint:OnDelete:CASCADE"`
}

type Example struct {
    gorm.Model
    SubcontentID uint
    Code         string       `gorm:"type:text"`
}
