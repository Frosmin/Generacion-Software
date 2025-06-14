package routes

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/genai"
)

type GeminiRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

type GeminiResponse struct {
	Text string `json:"text"`
}

func GeminiHandler(c *gin.Context) {
	var request GeminiRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de solicitud inválido"})
		return
	}

	promt := "El que te esta preguntado es un niño de 9 años, se te pasara un problema y un codigo que fue escrito por el niño, el codigo esta mal revisalo y dale pistas para que pueda arrglar solucionar su problema responde en 1 oracion nada mas, no le des la respuesta aqui esta el lo del niño:" + request.Prompt
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("Error: GEMINI_API_KEY no está configurada en variables de entorno")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuración de API incompleta"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Printf("Error al crear cliente de Gemini: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al conectar con la API de Gemini"})
		return
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.0-flash",
		genai.Text(promt),
		nil,
	)
	if err != nil {
		log.Printf("Error al generar contenido con Gemini: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar respuesta"})
		return
	}

	c.JSON(http.StatusOK, GeminiResponse{
		Text: result.Text(),
	})
}
