package models

import (
    "encoding/json"
	"database/sql/driver"
)

type Course struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Goto        string    `json:"goto"`
	Contents    []Content `json:"contents" gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE"`
}

type Content struct {
    ID          uint         `json:"id" gorm:"primaryKey;autoIncrement"`
    CourseID    uint         `json:"-" gorm:"not null"`
    Title       string       `json:"title"`
    Paragraph   GormStrings  `json:"paragraph" gorm:"type:jsonb"`
    Subcontent  []Subcontent `json:"subcontent" gorm:"foreignKey:ContentID;constraint:OnDelete:CASCADE"`
    Next        string       `json:"next,omitempty"` 
	MaxResourceConsumption int            `json:"maxResourceConsumption"`
    MaxProcessingTime      int            `json:"maxProcessingTime"`
}

type Subcontent struct {
	ID           uint        `json:"id" gorm:"primaryKey;autoIncrement"`
	ContentID    uint        `json:"-" gorm:"not null"`
	Subtitle     string      `json:"subtitle"`
	Subparagraph GormStrings `json:"subparagraph" gorm:"type:jsonb"`
	Example      GormStrings `json:"example" gorm:"type:jsonb"`
}

type GormStrings []string

func (g GormStrings) Value() (driver.Value, error) {
	return json.Marshal(g)
}

func (g *GormStrings) Scan(value interface{}) error {
	return json.Unmarshal(value.([]byte), g)
}
