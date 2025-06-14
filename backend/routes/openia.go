package routes

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type OpenAIRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float32   `json:"temperature"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ClientRequest struct {
	Prompt string `json:"prompt"`
}

func OpenAIHandler(c *gin.Context) {

	apiKey := os.Getenv("OPENAI_API_KEY")

	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "API Key de OpenAI no configurada"})
		return
	}

	var clientReq ClientRequest
	if err := c.ShouldBindJSON(&clientReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error al procesar la solicitud"})
		return
	}

	openAIReq := OpenAIRequest{
		Model: "gpt-3.5-turbo",
		Messages: []Message{
			{
				Role:    "user",
				Content: clientReq.Prompt,
			},
		},
		Temperature: 0.7,
		MaxTokens:   150,
	}

	jsonData, err := json.Marshal(openAIReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al preparar la solicitud"})
		return
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la solicitud a OpenAI"})
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al comunicarse con OpenAI"})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al leer la respuesta de OpenAI"})
		return
	}

	var result map[string]interface{}
	json.Unmarshal(body, &result)
	c.JSON(resp.StatusCode, result)
}
