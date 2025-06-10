package routes

import (
	"net/http"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

// GetUsersHandler godoc
// @Summary Obtiene todos los usuarios
// @Description Lista todos los usuarios registrados
// @Tags users
// @Produce json
// @Success 200 {array} models.UserSwagger
// @Router /api/users [get]
func GetUsersHandler(c *gin.Context) {
	var users []models.User
	db.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// GetUserHandler godoc
// @Summary Obtiene un usuario por ID
// @Description Retorna un usuario específico mediante su ID
// @Tags users
// @Produce json
// @Param id path int true "ID del usuario"
// @Success 200 {object} models.UserSwagger
// @Failure 404 {object} models.ErrorResponse
// @Router /api/user/{id} [get]
func GetUserHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db.DB.First(&user, id)

	if user.ID == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "usuario no encontrado"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// PostUserHandler godoc
// @Summary Crea un nuevo usuario
// @Description Registra un nuevo usuario en la base de datos, con contraseña cifrada
// @Tags users
// @Accept json
// @Produce json
// @Param user body models.User true "Datos del usuario"
// @Success 201 {object} models.UserSwagger
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/user [post]
func PostUserHandler(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "usuario no creado"})
		return
	}

	db.DB.Create(&user)
	c.JSON(http.StatusCreated, user)
}

// DeleteUserHandler godoc
// @Summary Elimina un usuario por ID
// @Description Elimina un usuario de forma definitiva mediante su ID
// @Tags users
// @Produce json
// @Param id path int true "ID del usuario"
// @Success 200 {object} models.MessageResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /api/user/{id} [delete]
func DeleteUserHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	db.DB.First(&user, id)

	if user.ID == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Usuario no encontrado"})
		return
	}

	// Eliminación definitiva
	db.DB.Unscoped().Delete(&user)

	c.JSON(http.StatusOK, models.MessageResponse{Message: "Usuario eliminado correctamente"})
}
