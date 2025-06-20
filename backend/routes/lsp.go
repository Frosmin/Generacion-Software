package routes

import (
	"log"
	"net/http"
	"os/exec"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permitir todas las conexiones
	},
}

// LSPHandler maneja las conexiones WebSocket para el Language Server Protocol
func LSPHandler(c *gin.Context) {
	// Obtener la conexión WebSocket desde Gin
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error al actualizar a WebSocket:", err)
		return
	}
	defer conn.Close()

	// Iniciar el servidor Pyright
	cmd := exec.Command("pyright-langserver", "--stdio")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Println("Error al obtener stdin:", err)
		return
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Println("Error al obtener stdout:", err)
		return
	}

	if err := cmd.Start(); err != nil {
		log.Println("Error al iniciar Pyright:", err)
		return
	}

	// Goroutine para leer mensajes del WebSocket y enviarlos a Pyright
	go func() {
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error al leer mensaje de WebSocket:", err)
				return
			}
			_, err = stdin.Write(message)
			if err != nil {
				log.Println("Error al escribir en stdin de Pyright:", err)
				return
			}
		}
	}()

	// Leer respuestas de Pyright y enviarlas al WebSocket
	buf := make([]byte, 4096)
	for {
		n, err := stdout.Read(buf)
		if err != nil {
			log.Println("Error al leer de stdout de Pyright:", err)
			return
		}
		err = conn.WriteMessage(websocket.TextMessage, buf[:n])
		if err != nil {
			log.Println("Error al escribir en WebSocket:", err)
			return
		}
	}
}
