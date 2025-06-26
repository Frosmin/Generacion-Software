FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias y descargarlas
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN go build -o main .

# Crear una imagen final más pequeña
FROM alpine:latest

WORKDIR /app

# # Copiar el binario compilado desde la etapa anterior
COPY --from=builder /app/main .

# # Puerto que expondrá la aplicación
EXPOSE 8080

# # Comando para ejecutar la aplicación
CMD ["./main"]