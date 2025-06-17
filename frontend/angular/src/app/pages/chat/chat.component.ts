import { Component, OnInit } from '@angular/core'; // Se añade OnInit
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Necesario para *ngFor, etc.
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]

// Interfaz para tipar los mensajes
interface ChatMessage {
  text: string;
  type: 'sent' | 'received';
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true, // Aseguramos que el componente es standalone
  imports: [CommonModule, FormsModule], // Añadimos CommonModule y FormsModule
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'] // Corregido de styleUrl a styleUrls
})
export class ChatComponent implements OnInit {
  inputChat = '';
  messages: ChatMessage[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Mensaje inicial de bienvenida
    this.messages.push({
      text: 'Hola, ¿en qué puedo ayudarte hoy?',
      type: 'received',
      timestamp: this.getCurrentTimestamp()
    });
  }

  private getCurrentTimestamp(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  chat(): void {
    if (!this.inputChat.trim()) {
      return; // No enviar mensajes vacíos
    }

    // Añadir mensaje del usuario
    const userMessage: ChatMessage = {
      text: this.inputChat,
      type: 'sent',
      timestamp: this.getCurrentTimestamp()
    };
    this.messages.push(userMessage);

    const messageToSend = this.inputChat;
    this.inputChat = ''; // Limpiar el campo de entrada

    // Llamada al backend
    this.http.post<any>('http://localhost:8080/api/gemini', {
      prompt: messageToSend
    }).subscribe({
      next: (response) => {
        const botMessage: ChatMessage = {
          text: response.text || "No se recibió una respuesta válida.",
          type: 'received',
          timestamp: this.getCurrentTimestamp()
        };
        this.messages.push(botMessage);
      },
      error: (error) => {
        console.error('Error al conectar con Gemini:', error);
        const errorMessage: ChatMessage = {
          text: 'Error al conectar con el servicio. Por favor, intenta más tarde.',
          type: 'received', // Se muestra como un mensaje del sistema/bot
          timestamp: this.getCurrentTimestamp()
        };
        this.messages.push(errorMessage);
      }
    });
  }
}