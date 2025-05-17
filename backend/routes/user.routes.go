package routes

import (
	"net/http"

	"github.com/Frosmin/backend/db"
	"github.com/Frosmin/backend/models"
	"github.com/gin-gonic/gin"
)

// GetUsersHandler godoc
// @Summary Obtener todos los usuarios
// @Description Retorna una lista de todos los usuarios registrados
// @Tags usuarios
// @Accept json
// @Produce json
// @Success 200 {array} docs.User
// @Router /users [get]
func GetUsersHandler(c *gin.Context) {
	var users []models.User
	db.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// GetUserHandler godoc
// @Summary Obtener un usuario por ID
// @Description Retorna un usuario específico por su ID
// @Tags usuarios
// @Accept json
// @Produce json
// @Param id path string true "ID del usuario"
// @Success 200 {object} docs.User
// @Failure 404 {object} map[string]string
// @Router /user/{id} [get]
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

// PostUserHandler godoc
// @Summary Crear un nuevo usuario
// @Description Crea un nuevo registro de usuario
// @Tags usuarios
// @Accept json
// @Produce json
// @Param user body docs.User true "Datos del usuario"
// @Success 201 {object} docs.User
// @Failure 400 {object} map[string]string
// @Router /user [post]
func PostUserHandler(c *gin.Context) {
	var user models.User

	var error = c.ShouldBindJSON(&user)

	if error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "usuario no creado"})
		return
	}

	// Crear al usuario en la base de datos
	db.DB.Create(&user)
	c.JSON(http.StatusCreated, user)
}

// DeleteUserHandler godoc
// @Summary Eliminar un usuario
// @Description Elimina un usuario específico por su ID
// @Tags usuarios
// @Accept json
// @Produce json
// @Param id path string true "ID del usuario"
// @Success 200 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /user/{id} [delete]
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
