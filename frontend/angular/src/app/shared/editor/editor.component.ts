/* eslint-disable @typescript-eslint/no-explicit-any */
// EditorComponent.ts
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule, CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { HttpClient } from '@angular/common/http';

// Importacion de lint y modo python para CodeMirror
import * as CodeMirrorNS from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/mode/python/python';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
(window as any).CodeMirror = CodeMirrorNS;
declare const CodeMirror: any;

// Keywords de Python para autocompletado
const PYTHON_KEYWORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 
  'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 
  'return', 'try', 'while', 'with', 'yield', 'print', 'range', 'len', 'str', 'int', 'float',
  'list', 'dict', 'set', 'tuple', 'input', 'sum', 'min', 'max'
];

// Funciones built-in de Python para autocompletado
const PYTHON_BUILTINS = [
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable', 'chr',
  'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate',
  'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals',
  'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass',
  'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
  'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round',
  'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple',
  'type', 'vars', 'zip'
];

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
    const message = error.message || error.toString();
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
  imports: [CommonModule, FormsModule, CodemirrorModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @ViewChild('codeEditor') private codeEditorComponent!: CodemirrorComponent;
  codigo = '';
  inputs = '';
  output = '';
  inputChat = '';
  outputChat = '';

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
      'Ctrl-Space': (cm: any) => {
        CodeMirror.showHint(cm, (cm: any) => {
          const cursor = cm.getCursor();
          const token = cm.getTokenAt(cursor);
          const start = token.start;
          const end = cursor.ch;
          const line = cursor.line;
          const currentWord = token.string;

          const list = [...PYTHON_KEYWORDS, ...PYTHON_BUILTINS].filter(word => 
            word.toLowerCase().startsWith(currentWord.toLowerCase()) && 
            word !== currentWord
          );

          // Obtener palabras del documento actual
          const words = new Set<string>();
          for (let i = 0; i < cm.lineCount(); i++) {
            const lineText = cm.getLine(i);
            const wordMatches = lineText.match(/[\w$]+/g);
            if (wordMatches) {
              wordMatches.forEach((word: string) => words.add(word));
            }
          }

          // Agregar palabras del documento a las sugerencias
          words.forEach(word => {
            if (word.toLowerCase().startsWith(currentWord.toLowerCase()) && 
                word !== currentWord && 
                !list.includes(word)) {
              list.push(word);
            }
          });

          return {
            list: list.sort(),
            from: CodeMirror.Pos(line, start),
            to: CodeMirror.Pos(line, end)
          };
        }, {
          completeSingle: false
        });
      },
      'Tab': (cm: any) => {
        if (cm.somethingSelected()) {
          cm.indentSelection('add');
        } else {
          const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
          cm.replaceSelection(spaces);
        }
      }
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
  pyodideReady = false;
  codeMirrorInstance: any;
  editorOptions: any;
  codeEditor: any;

  constructor(private http: HttpClient) {
    // Función de autocompletado personalizada
    const pythonHint = (cm: any) => {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      
      // No mostrar sugerencias dentro de strings o comentarios
      if (token.type === 'string' || token.type === 'comment') {
        return null;
      }

      const words = new Set<string>();
      
      // Agregar palabras clave de Python
      PYTHON_KEYWORDS.forEach(word => words.add(word));
      
      // Agregar palabras del documento actual
      for (let i = 0; i < cm.lineCount(); i++) {
        const lineText = cm.getLine(i);
        const wordMatches = lineText.match(/[\\w$]+/g);
        if (wordMatches) {
          wordMatches.forEach((word: string) => words.add(word));
        }
      }

      return {
        list: Array.from(words).filter(word => 
          word.toLowerCase().startsWith(token.string.toLowerCase())
        ).sort(),
        from: {line: cursor.line, ch: token.start},
        to: {line: cursor.line, ch: token.end}
      };
    };

    this.editorOptions = {
      mode: 'python',
      theme: 'material',
      lineNumbers: true,
      lineWrapping: true,
      styleActiveLine: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true,
      extraKeys: {
        'Ctrl-Space': false,
        'Ctrl-B': false
      },
      hintOptions: {
        completeSingle: false,
        hint: pythonHint
      }
    };
  }

  async ngOnInit() {
    // @ts-expect-error: loadPyodide no está definido en el contexto de TypeScript
    this.pyodide = await loadPyodide();
    this.pyodideReady = true;
    (window as any).pyodideInstance = this.pyodide;
    console.log('[Editor] Pyodide cargado desde CDN');
  }

  ngAfterViewInit() {
    // Esperar a que el editor esté listo
    setTimeout(() => {
      if (this.codeEditorComponent) {
        this.codeEditor = this.codeEditorComponent.codeMirror;
        
        // Configurar el autocompletado automático
        this.codeEditor.on('inputRead', (cm: any, change: any) => {
          if (!change || !change.text) return;
          
          const cursor = cm.getCursor();
          const token = cm.getTokenAt(cursor);
          
          // No mostrar sugerencias para operadores o dentro de strings/comentarios
          if (token.type === 'string' || token.type === 'comment') {
            return;
          }
          
          // Verificar si el último carácter ingresado es una letra o guión bajo
          const lastChar = change.text[change.text.length - 1];
          if (lastChar && lastChar.match(/[a-zA-Z_]/)) {
            cm.showHint({ 
              completeSingle: false,
              closeOnUnfocus: false,
              alignWithWord: true
            });
          }
        });

        // También mostrar sugerencias al borrar
        this.codeEditor.on('keyup', (cm: any, event: KeyboardEvent) => {
          const cursor = cm.getCursor();
          const token = cm.getTokenAt(cursor);
          
          // No mostrar sugerencias para operadores o dentro de strings/comentarios
          if (token.type === 'string' || token.type === 'comment') {
            return;
          }
          
          // Mostrar sugerencias al borrar si hay texto que completar
          if (event.key === 'Backspace' && token.string.length > 0) {
            cm.showHint({ 
              completeSingle: false,
              closeOnUnfocus: false,
              alignWithWord: true
            });
          }
        });
      }
    }, 100);
  }

  // Vincular instancia de CodeMirror
  onEditorInit(instance: any) {
    this.codeMirrorInstance = instance;
    
    // Activar autocompletado al escribir
    instance.on('inputRead', (cm: any, change: any) => {
      if (!change || change.origin !== '+input') return;
      
      const cur = cm.getCursor();
      const token = cm.getTokenAt(cur);
      
      // Solo mostrar sugerencias si estamos escribiendo una palabra
      if (token.type !== 'operator' && token.type !== 'string' && 
          token.string.length > 1 && !/^\d+$/.test(token.string)) {
        CodeMirror.commands.autocomplete(cm);
      }
    });
  }

  // Forzar el lint en cada cambio de código
  onCodigoChange() {
    if (this.codeMirrorInstance) {
      this.codeMirrorInstance.performLint();
    }
  }

  async ejecutarCodigo(): Promise<void> {
    if (!this.pyodide) {
      this.output = 'Pyodide no está cargado correctamente.';
      return;
    }

    try {
      const inputLines = this.inputs.split('\n');
      let inputIndex = 0;

      const inputFunction = () => {
        if (inputIndex >= inputLines.length) {
          throw new Error('No hay más inputs disponibles');
        }
        return inputLines[inputIndex++];
      };

      this.pyodide.globals.set('input', inputFunction);

      this.output = '';

      this.pyodide.setStdout({
        batched: (text: string) => {
          this.output += text;
        },
      });

      await this.pyodide.runPythonAsync(this.codigo);
    } catch (error) {
      this.output = `Error: ${String(error)}`;
    }
  }

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