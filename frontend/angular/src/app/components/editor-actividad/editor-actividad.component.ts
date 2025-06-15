import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
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
  @Input() base: string = '';
  @Input() solucion: string = '';
  @Output() salida = new EventEmitter<string>();
  codigo: string = '';
  resultado: string = '';

  cmOptions = {
    theme: 'material',
    lineNumbers: true,
    mode: 'python'
  };

  ngOnInit(): void {
    this.codigo = this.base;
  }

  
  enviar(): void {
    if (this.normalizar(this.codigo) === this.normalizar(this.solucion)) {
      this.resultado = '¡Correcto!';
    } else {
      this.resultado = 'Tu solución no coincide. Intenta de nuevo.';
    }
  }

  normalizar(texto: string): string {
    return texto.replace(/\s+/g, '').toLowerCase();
  }

  resetear(): void {
    this.codigo = this.base;
    this.resultado = '';
  }
}
