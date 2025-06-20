package models

import (
    //"gorm.io/gorm"
    "encoding/json"
	"database/sql/driver"
)

type Course struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Goto        string    `json:"goto"`
	Contents    []Content `json:"contents" gorm:"foreignKey:CourseID"`
}

type Content struct {
    ID          uint         `json:"id" gorm:"primaryKey"`
    CourseID    uint         `json:"-"`
    Title       string       `json:"title"`
    Paragraph   GormStrings  `json:"paragraph" gorm:"type:jsonb"`
    Subcontent  []Subcontent `json:"subcontent" gorm:"foreignKey:ContentID"`
    Next        string       `json:"next,omitempty"` 
}
type Subcontent struct {
	ID           uint        `json:"id" gorm:"primaryKey"`
	ContentID    uint        `json:"-"`
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
