package docs

import "time"

//para gorm
type GormModel struct {
	ID        uint       `json:"id" gorm:"primarykey" example:"1"`
	CreatedAt time.Time  `json:"createdAt" example:"2023-01-01T00:00:00Z"`
	UpdatedAt time.Time  `json:"updatedAt" example:"2023-01-01T00:00:00Z"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" example:"null"`
}
