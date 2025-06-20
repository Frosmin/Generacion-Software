package routes

import (
	"fmt"
	"os/exec"

	"github.com/gin-gonic/gin"
)

func Homehandler(c *gin.Context) {
	c.String(200, "esto vien de la carpeta routesss")
}

func VerificarPythonHandler(c *gin.Context) {
	rutaArchivo := "test.py" // En la práctica lo recibes por POST o desde un path

	cmd := exec.Command("pyright", rutaArchivo)
	salida, err := cmd.CombinedOutput()
	if err != nil {
		c.String(400, fmt.Sprintf("Errores detectados:\n%s", salida))
		return
	}

	c.String(200, fmt.Sprintf("Sin errores:\n%s", salida))
}
