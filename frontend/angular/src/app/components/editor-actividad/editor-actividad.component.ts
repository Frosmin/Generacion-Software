import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@Component({
  selector: 'app-editor-actividad',
  standalone: true,
  imports: [FormsModule, CodemirrorModule],
  templateUrl: './editor-actividad.component.html',
  styleUrls: ['./editor-actividad.component.scss']
})
export class EditorActividadComponent implements OnInit {
  @Input() base: string = 'print("hola")  # completa el código';
  @Input() solucion: string = 'print("hola mundo")';
  @Output() salida = new EventEmitter<string>();
  @Output() salidaCodigo = new EventEmitter<string>();
  codigo: string = '';
  resultado: string = '';

  cmOptions = {
    theme: 'material',
    lineNumbers: true,
    mode: 'python'
  };

  // ngOnInit(): void {
  //   this.codigo = this.base;
  // }
  ngOnInit(): void {
    this.codigo = this.base || 'print("hola")  # completa el código';
    this.solucion = this.solucion || 'print("hola mundo")';
  }

  enviar(): void {
    if (!this.codigo.trim()) {
      this.resultado = 'Ingresa una solución primero.';
      this.salida.emit(this.resultado);
      return;
    }

    const normalizadoUser = this.normalizar(this.codigo);
    const normalizadoSol = this.normalizar(this.solucion);

    if (normalizadoUser === normalizadoSol) {
      this.resultado = '¡Correcto!';
    } else {
      this.resultado = 'Tu solución no coincide. Intenta de nuevo.';
    }

    this.salida.emit(this.resultado);
  }

  resetear(): void {
    this.codigo = this.base;
    this.resultado = '';
    this.salida.emit('');
  }

  private normalizar(texto: string): string {
    return texto.replace(/\s+/g, '').toLowerCase();
  }
}
