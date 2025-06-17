import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'codemirror/addon/lint/lint';
import 'codemirror/mode/python/python';
import 'codemirror/addon/selection/active-line';



@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {


  inputChat = '';
  outputChat = '';


    constructor(private http: HttpClient) {}

  chat(): void{
    if (!this.inputChat.trim()) {
      this.outputChat = 'Por favor, escribe un mensaje.';
      return;
    }

    this.http.post<any>('http://localhost:8080/api/gemini', {
      prompt: this.inputChat
    }).subscribe({
      next: (response) => {
        this.outputChat = response.text;
      },
      error: (error) => {
        console.error('Error al conectar con Gemini:', error);
        this.outputChat = 'Error al conectar con el servicio. Por favor, intenta más tarde.';
      }
    });
  }

}
