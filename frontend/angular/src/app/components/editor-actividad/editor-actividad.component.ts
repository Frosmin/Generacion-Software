import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
declare var loadPyodide: any;

@Component({
  selector: 'app-editor-actividad',
  standalone: true,
  imports: [FormsModule, CodemirrorModule,CommonModule],
  templateUrl: './editor-actividad.component.html',
  styleUrls: ['./editor-actividad.component.scss']
})
export class EditorActividadComponent implements OnInit {
  @Input() base: string = 'print("hola")  # completa el código';
  @Input() solucion: string = 'print("hola mundo")';
  @Output() salida = new EventEmitter<string>();
  @Output() salidaCodigo = new EventEmitter<string>();
  codigo: string = '';
  pyodide: any = null;
  veredicto: string = '';
  cmOptions = {
    theme: 'material',
    lineNumbers: true,
    mode: 'python'
  };

  // ngOnInit(): void {
  //   this.codigo = this.base;
  // if (!this.pyodide) {
  //     this.pyodide = await loadPyodide();
  //   }
  // }
  async ngOnInit(): Promise<void> {
    this.codigo = this.base || 'print("hola")  # completa el código';
    this.solucion = this.solucion || 'print("hola mundo")';
    if (!this.pyodide) {
      this.pyodide = await loadPyodide();
    }
  }

  async enviar() {
    if (!this.codigo.trim()) {
      this.veredicto = '⚠️ Ingresa una solución primero.';
      this.salidaCodigo.emit('');
      return;
    }

    // Veredicto lógico
    const correcto = this.normalizar(this.codigo) === this.normalizar(this.solucion);
    this.veredicto = correcto
      ? '✅ Tu solución es correcta.'
      : '❌ Tu solución es incorrecta.';

    // Ejecutar código
    try {
      const resultado = await this.pyodide.runPythonAsync(this.codigo);
      this.salidaCodigo.emit(resultado?.toString() ?? '(sin salida)');
    } catch (e) {
      this.salidaCodigo.emit(`Error: ${e}`);
    }
  }


  resetear(): void {
    this.codigo = this.base;
    this.veredicto = '';
    this.salidaCodigo.emit('');
  }

  private normalizar(texto: string): string {
    return texto.replace(/\s+/g, '').toLowerCase();
  }
}
