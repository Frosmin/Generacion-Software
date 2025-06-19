
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
interface Pyodide {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (config: { batched: (text: string) => void }) => void;
}
declare function loadPyodide(): Promise<Pyodide>;
@Component({
  selector: 'app-editor-actividad',
  standalone: true,
  imports: [FormsModule, CodemirrorModule,CommonModule],
  templateUrl: './editor-actividad.component.html',
  styleUrls: ['./editor-actividad.component.scss']
})
export class EditorActividadComponent implements OnInit {
  @Input() base = '';
  @Input() solucion = '';
  @Output() salida = new EventEmitter<string>();
  @Output() salidaCodigo = new EventEmitter<string>();
  codigo = '';
  pyodide: Pyodide | null = null;
  veredicto = '';
  cmOptions = {
    theme: 'material',
    lineNumbers: true,
    mode: 'python',
    lineWrapping: true,
    viewportMargin: Infinity, 
    extraKeys: {
      'Ctrl-Space': 'autocomplete' 
    }
  };
  //cuando ya haya conexión o atributos con la bd recien cambiamos eso por eso
  //por el momento con ese mock
  // ngOnInit(): void {
  //   this.codigo = this.base;
  // if (!this.pyodide) {
  //     this.pyodide = await loadPyodide();
  //   }
  // }
  async ngOnInit(): Promise<void> {
    this.base = 'print("hola")  # completa el código "hola mundo" y borra todo el comentario';
    this.codigo = this.base;
    this.solucion = this.solucion || 'print("hola mundo")';
    if (!this.pyodide) {
      this.pyodide = await loadPyodide();
    }
  }

  async enviar() {
    if (!this.codigo.trim()) {
      this.veredicto = 'Ingresa una solución primero.';
      this.salidaCodigo.emit('');
      return;
    }

    const correcto = this.normalizar(this.codigo) === this.normalizar(this.solucion);
    this.veredicto = correcto
      ? 'Tu solución es correcta.'
      : 'Tu solución es incorrecta.';

    try {
      const pyodide = this.pyodide!;
      let salidaTemporal = '';

      pyodide.setStdout({
        batched: (text: string) => {
          salidaTemporal += text;
        }
      });

      await pyodide.runPythonAsync(this.codigo);
      this.salidaCodigo.emit(salidaTemporal || '(sin salida)');
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
