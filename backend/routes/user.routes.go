package routes

import (
	"net/http"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

func GetUsersHandler(c *gin.Context) {
	var users []models.User
	db.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func GetUserHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db.DB.First(&user, id)

	if user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuario no encontrado"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func PostUserHandler(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "usuario no creado"})
		return
	}

	// Cifrar la contraseña antes de guardarla
	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error al cifrar la contraseña"})
		return
	}

	// Guardar usuario en la base de datos
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "usuario no creado"})
		return
	}
	c.JSON(http.StatusCreated, user)
}

func DeleteUserHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	db.DB.First(&user, id)

	if user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Eliminación definitiva
	db.DB.Unscoped().Delete(&user)

	// Opcional: soft delete (mantiene el registro pero lo marca como eliminado)
	// db.DB.Delete(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Usuario eliminado correctamente"})
}

func LoginHandler(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "datos de inicio de sesión inválidos"})
		return
	}

	var dbUser models.User
	if err := db.DB.Where("email = ?", user.Email).First(&dbUser).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "usuario no encontrado"})
		return
	}

	if err := dbUser.CheckPassword(user.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "contraseña incorrecta"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "inicio de sesión exitoso", "user": dbUser})
}
