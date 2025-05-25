import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

// Importacion de lint y modo python para CodeMirror
import * as CodeMirrorNS from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/mode/python/python';
(window as any).CodeMirror = CodeMirrorNS;
declare const CodeMirror: any;

// Lint global para CodeMirror y Pyodide 
function pythonLint(code: string) {
  const pyodide = (window as any).pyodideInstance;
  if (!pyodide) {
    console.log('[Editor] Lint: Pyodide no está listo');
    return [];
  }
  try {
    pyodide.runPython(`compile(${JSON.stringify(code)}, '<input>', 'exec')`);
    return [];
  } catch (error: any) {
    let message = error.message || error.toString();
    let line = 0;
    // Buscar la línea del "<input>"
    const inputLineMatch = message.match(/File "<input>", line (\d+)/);
    if (inputLineMatch) {
      line = parseInt(inputLineMatch[1], 10) - 1;
    }
    // Mostrar mensaje
    let userMessage = 'Error de sintaxis';
    if (message.includes('SyntaxError')) {
      userMessage = message.replace('SyntaxError:', '').trim();
    } else if (message) {
      userMessage = message;
    }
    console.log('[Editor] Error de sintaxis detectado:', userMessage, 'en línea', line + 1);
    // Marca toda la línea
    return [{
      from: CodeMirror.Pos(line, 0),
      to: CodeMirror.Pos(line, 100),
      message: userMessage,
      severity: 'error'
    }];
  }
}


@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule,CodemirrorModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  codigo: string = '';
  inputs: string = '';
  output: string = '';
  cmOptions = {
    mode: 'python',
    theme: 'material',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    styleActiveLine: true,
    matchBrackets: true,
    viewportMargin: Infinity,
    placeholder: 'Escribe tu código…',
    gutters: ['CodeMirror-lint-markers'],
    lint: {
      getAnnotations: pythonLint,
      async: false
    },
    extraKeys: {
      'Ctrl-Space': 'autocomplete'
    }
  };

  inputOptions = {
    ...this.cmOptions,
    mode: 'text/plain',
    lineNumbers: false,
    placeholder: 'Escribe tus inputs…',
    lint: false 
  };

  pyodide: any;
  pyodideReady: boolean = false;
  codeMirrorInstance: any;

  async ngOnInit() {
    // @ts-ignore
    this.pyodide = await loadPyodide();
    this.pyodideReady = true;
    (window as any).pyodideInstance = this.pyodide;
    console.log('[Editor] Pyodide cargado desde CDN');
  }

  // Vincular instancia de CodeMirror
  onEditorInit(instance: any) {
    this.codeMirrorInstance = instance;
  }

  // Forzar el lint en cada cambio de código
  onCodigoChange() {
    if (this.codeMirrorInstance) {
      this.codeMirrorInstance.performLint();
    }
  }

  async ejecutarCodigo() {
    try {
      const inputLines = this.inputs.split('\n');
      let inputIndex = 0;

   
      const inputFunction = (prompt = '') => {
        if (inputIndex >= inputLines.length) {
          throw new Error('No hay más inputs disponibles');
        }
        const value = inputLines[inputIndex];
        inputIndex++;
        return value;
      };

      
      this.pyodide.globals.set('input', inputFunction);

      
      this.output = '';

      
      this.pyodide.setStdout({
        batched: (text: string) => {
          this.output += text;
        }
      });

    
      await this.pyodide.runPythonAsync(this.codigo);

    } catch (error) {
      this.output = `Error: ${error}`;
    }
  }



}
