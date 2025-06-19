import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PythonLSPService {
  private socket: WebSocket;
  private messageSubject = new Subject<any>();
  private initialized = false;

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080/lsp');
    this.initializeLSPServer();
  }

  private initializeLSPServer() {
    this.socket.onopen = () => {
      if (this.initialized) return;

      const initializeParams = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          processId: null, // No es necesario en el cliente
          rootUri: 'file:///',
          capabilities: {
            textDocument: {
              completion: {
                completionItem: {
                  snippetSupport: true
                }
              }
            }
          }
        }
      };
      
      this.sendRequest(initializeParams);
      this.initialized = true;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.messageSubject.next(message);
      } catch (error) {
        console.error('Error parsing LSP message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  public sendRequest(params: any): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(params));
    }
  }

  public onMessage() {
    return this.messageSubject.asObservable();
  }

  public dispose() {
    if (this.socket) {
      this.socket.close();
    }
  }
} 