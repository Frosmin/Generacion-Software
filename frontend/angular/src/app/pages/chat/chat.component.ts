import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

// Interfaz para tipar los mensajes
interface ChatMessage {
  text: string;
  type: 'sent' | 'received';
  timestamp: string;
  isWelcome?: boolean; // para identificar el mensaje inicial
}

interface GeminiResponse {
  text: string;
  // Puedes añadir más propiedades aquí si el backend devuelve más datos
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  inputChat = '';
  messages: ChatMessage[] = [];
  private langChangeSub!: Subscription;

  constructor(private http: HttpClient, private translate: TranslateService) {}

  ngOnInit(): void {
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.updateWelcomeMessage();
    });

    this.updateWelcomeMessage();
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }

  private updateWelcomeMessage() {
    const welcomeText = this.translate.instant('chat.message');
    const index = this.messages.findIndex((m) => m.isWelcome);

    if (index >= 0) {
      this.messages[index].text = welcomeText;
      this.messages[index].timestamp = this.getCurrentTimestamp();
    } else {
      this.messages.unshift({
        text: welcomeText,
        type: 'received',
        timestamp: this.getCurrentTimestamp(),
        isWelcome: true,
      });
    }
  }

  private getCurrentTimestamp(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  chat(): void {
    if (!this.inputChat.trim()) {
      return; // No enviar mensajes vacíos
    }

    const userMessage: ChatMessage = {
      text: this.inputChat,
      type: 'sent',
      timestamp: this.getCurrentTimestamp(),
    };
    this.messages.push(userMessage);

    const messageToSend = this.inputChat;
    this.inputChat = '';

    this.http
      .post<GeminiResponse>('http://localhost:8080/api/gemini', {
        prompt: messageToSend,
      })
      .subscribe({
        next: (response) => {
          const fallbackText = this.translate.instant('chat.noValidResponse');
          const botMessage: ChatMessage = {
            text: response.text || fallbackText,
            type: 'received',
            timestamp: this.getCurrentTimestamp(),
          };
          this.messages.push(botMessage);
        },
        error: (error) => {
          console.error('Error al conectar con Gemini:', error);
          const errorMessage: ChatMessage = {
            text: this.translate.instant('chat.error'),
            type: 'received',
            timestamp: this.getCurrentTimestamp(),
          };
          this.messages.push(errorMessage);
        },
      });
  }
}
