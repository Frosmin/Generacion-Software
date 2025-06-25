/* eslint-disable @typescript-eslint/no-explicit-any */
// EditorComponent.ts - Versión con límites funcionando correctamente
import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule, CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { HttpClient } from '@angular/common/http';
import { PythonLSPService, LSPMessage, CompletionResponse } from '../../services/python-lsp.service';
import { Subscription } from 'rxjs';

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
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('codeEditor') private codeEditorComponent!: CodemirrorComponent;
  
  // Inputs para hacer el componente reutilizable
  @Input() mode: 'full' | 'activity' = 'full'; // Modo del editor
  @Input() initialCode = ''; // Código inicial
  @Input() correctSolution = ''; // Solución correcta (para modo actividad)
  @Input() showChat = true; // Mostrar funcionalidad de chat
  @Input() showInputOutput = true; // Mostrar paneles de input/output
  @Input() height = '70vh'; // Altura del editor
  @Input() placeholder = 'Escribe tu código…'; // Placeholder
  
  // Nuevos inputs para límites de ejecución
  @Input() timeoutSeconds = 5; // Límite de tiempo en segundos
  @Input() memoryLimitMB = 30; // Límite de memoria en MB
  @Input() maxOutputLines = 1000; // Límite de líneas de output
  
  // Outputs para comunicación con el componente padre - CORREGIDOS
  @Output() codeChange = new EventEmitter<string>();
  @Output() codeOutput = new EventEmitter<string>();
  @Output() codeExecuted = new EventEmitter<{code: string, output: string}>();
  @Output() solutionCheck = new EventEmitter<{correct: boolean, output: string}>();
  @Output() executionTimeout = new EventEmitter<void>();
  @Output() memoryExceeded = new EventEmitter<void>();
  @Output() outputLimitExceeded = new EventEmitter<void>();

  codigo = '';
  inputs = '';
  output = '';
  inputChat = '';
  outputChat = '';
  isExecuting = false;

  cmOptions = {
    mode: 'python',
    theme: 'material',
    lineNumbers: true,
    indentUnit: 4,
    lineWrapping: true,
    viewportMargin: Infinity, 
    tabSize: 4,
    styleActiveLine: true,
    matchBrackets: true,
    placeholder: this.placeholder,
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
  private lspSubscription: Subscription | null = null;
  private completionItems: { label: string }[] = [];
  private executionTimeoutHandle: any = null;
  private executionStartTime = 0;

  constructor(
    private http: HttpClient,
    private pythonLSP: PythonLSPService
  ) {
    // Función de autocompletado personalizada que combina LSP y palabras clave
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
      
      // Agregar funciones built-in de Python
      PYTHON_BUILTINS.forEach(word => words.add(word));
      
      // Agregar sugerencias del LSP
      this.completionItems.forEach(item => words.add(item.label));
      
      // Agregar palabras del documento actual
      for (let i = 0; i < cm.lineCount(); i++) {
        const lineText = cm.getLine(i);
        const wordMatches = lineText.match(/[\w$]+/g);
        if (wordMatches) {
          wordMatches.forEach((word: string) => words.add(word));
        }
      }

      // Filtrar sugerencias basadas en el token actual
      const filteredWords = Array.from(words).filter(word => 
        word.toLowerCase().startsWith(token.string.toLowerCase()) && 
        word !== token.string
      ).sort();

      return {
        list: filteredWords,
        from: CodeMirror.Pos(cursor.line, token.start),
        to: CodeMirror.Pos(cursor.line, token.end)
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
        'Ctrl-Space': (cm: any) => {
          // Solicitar sugerencias al LSP antes de mostrar el hint
          const cursor = cm.getCursor();
          this.requestCompletions(cm, cursor);
          cm.showHint({
            hint: pythonHint,
            completeSingle: false,
            closeOnUnfocus: false,
            alignWithWord: true
          });
        },
        'Ctrl-B': false
      },
      hintOptions: {
        hint: pythonHint,
        completeSingle: false,
        closeOnUnfocus: false,
        alignWithWord: true
      }
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialCode'] && changes['initialCode'].currentValue !== undefined) {
      this.codigo = this.initialCode;
    }
    if (changes['placeholder']) {
      this.cmOptions.placeholder = this.placeholder;
    }
  }

  async ngOnInit() {
    // @ts-expect-error: loadPyodide no está definido en el contexto de TypeScript
    this.pyodide = await loadPyodide();
    this.pyodideReady = true;
    (window as any).pyodideInstance = this.pyodide;
    console.log('[Editor] Pyodide cargado desde CDN');

    // Inicializar código si se proporciona
    if (this.initialCode) {
      this.codigo = this.initialCode;
    }

    // Suscribirse a los mensajes del LSP
    this.lspSubscription = this.pythonLSP.onMessage().subscribe((message: LSPMessage) => {
      if (message.method === 'textDocument/completion' && message.result) {
        // Asegurarse de que el resultado sea del tipo esperado
        const completionResult = message.result as CompletionResponse;
        this.completionItems = completionResult.items || [];
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.codeEditorComponent) {
        this.codeEditor = this.codeEditorComponent.codeMirror;

        // Autocompletado en tiempo real al escribir
        this.codeEditor.on('inputRead', (cm: any, change: any) => {
          if (!change || !change.text) return;
          const lastChar = change.text[change.text.length - 1];
          // Solo dispara si el usuario escribe letra, número, punto o guion bajo
          if (lastChar && /[\w.]/.test(lastChar)) {
            const cursor = cm.getCursor();
            const token = cm.getTokenAt(cursor);
            if (token.type !== 'string' && token.type !== 'comment') {
              // Solicita sugerencias al LSP y muestra el hint con la función unificada
              this.requestCompletions(cm, cursor);
              cm.showHint({
                hint: this.editorOptions.hintOptions.hint,
                completeSingle: false,
                closeOnUnfocus: false,
                alignWithWord: true
              });
            }
          }
        });

        // Notificar cambios al LSP y emitir evento
        this.codeEditor.on('change', (cm: any) => {
          this.notifyLSPChanges(cm);
          this.codigo = cm.getValue();
          this.codeChange.emit(this.codigo);
        });
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.lspSubscription) {
      this.lspSubscription.unsubscribe();
    }
    if (this.executionTimeoutHandle) {
      clearTimeout(this.executionTimeoutHandle);
    }
  }

  private createSecurePythonCode(code: string): string {
    // Sistema de límites simplificado y más efectivo
    const secureWrapper = `
import sys
import time
import signal
from io import StringIO

# Configuración de límites
MAX_OUTPUT_LINES = ${this.maxOutputLines}
TIMEOUT_SECONDS = ${this.timeoutSeconds}

# Variables de control
_output_lines = 0
_start_time = time.time()
_execution_stopped = False
_original_stdout = sys.stdout

class SecurityStringIO(StringIO):
    def write(self, s):
        global _output_lines, _execution_stopped
        
        if _execution_stopped:
            return len(s)
        
        # Verificar timeout
        if time.time() - _start_time > TIMEOUT_SECONDS:
            raise TimeoutError("TIMEOUT_EXCEEDED")
        
        # Contar líneas
        _output_lines += s.count('\\n')
        if _output_lines > MAX_OUTPUT_LINES:
            raise RuntimeError("OUTPUT_LIMIT_EXCEEDED")
        
        return super().write(s)

# Función trace para detectar bucles infinitos
def trace_execution(frame, event, arg):
    if time.time() - _start_time > TIMEOUT_SECONDS:
        raise TimeoutError("TIMEOUT_EXCEEDED")
    return trace_execution

# Configurar captura de salida
sys.stdout = SecurityStringIO()

# Activar trazado
sys.settrace(trace_execution)

try:
    # Código del usuario
${code.split('\n').map(line => '    ' + line).join('\n')}

except TimeoutError as e:
    if "TIMEOUT_EXCEEDED" in str(e):
        raise Exception("TIMEOUT_EXCEEDED")
    raise
except RuntimeError as e:
    if "OUTPUT_LIMIT_EXCEEDED" in str(e):
        raise Exception("OUTPUT_LIMIT_EXCEEDED")
    raise
except MemoryError:
    raise Exception("MEMORY_LIMIT_EXCEEDED")
finally:
    sys.settrace(None)
    if not _execution_stopped:
        output_content = sys.stdout.getvalue()
        sys.stdout = _original_stdout
        if output_content:
            print(output_content, end='')
`;
    return secureWrapper;
  }

  private requestCompletions(cm: any, cursor: any) {
    const documentUri = 'file:///workspace/main.py';
    const position = {
      line: cursor.line,
      character: cursor.ch
    };

    this.pythonLSP.sendRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'textDocument/completion',
      params: {
        textDocument: { uri: documentUri },
        position: position
      }
    });
  }

  private notifyLSPChanges(cm: any) {
    const documentUri = 'file:///workspace/main.py';
    const content = cm.getValue();

    this.pythonLSP.sendRequest({
      jsonrpc: '2.0',
      method: 'textDocument/didChange',
      params: {
        textDocument: {
          uri: documentUri,
          version: Date.now()
        },
        contentChanges: [{ text: content }]
      }
    });
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

  // Método privado para configurar stdout de forma consistente
  private setupStdout(): void {
    this.pyodide.setStdout({
      batched: (text: string) => {
        this.output += text;
      },
    });
  }

  // Método privado para configurar input de forma consistente
  private setupInput(): void {
    const inputLines = this.inputs.split('\n').filter(line => line.trim() !== '');
    let inputIndex = 0;

    const inputFunction = () => {
      if (inputIndex >= inputLines.length) {
        throw new Error('No hay más inputs disponibles');
      }
      return inputLines[inputIndex++];
    };

    this.pyodide.globals.set('input', inputFunction);
  }

  // Método para detener ejecución
  stopExecution(): void {
    if (this.executionTimeoutHandle) {
      clearTimeout(this.executionTimeoutHandle);
      this.executionTimeoutHandle = null;
    }
    this.isExecuting = false;
    this.output = 'Ejecución detenida por el usuario';
    this.codeOutput.emit(this.output);
  }

  // Método principal para ejecutar código con límites efectivos
  private async executeCodeWithLimits(code: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.isExecuting = true;
      this.executionStartTime = Date.now();
      let output = '';
      
      // Timeout de JavaScript como respaldo
      this.executionTimeoutHandle = setTimeout(() => {
        this.isExecuting = false;
        this.executionTimeout.emit();
        resolve('Se excedió el tiempo de ejecución');
      }, this.timeoutSeconds * 1000);

      // Configurar captura de stdout
      this.pyodide.setStdout({
        batched: (text: string) => {
          output += text;
        },
      });

      // Configurar input si hay inputs disponibles
      if (this.inputs.trim()) {
        this.setupInput();
      }

      // Crear código seguro
      const secureCode = this.createSecurePythonCode(code);

      // Ejecutar código
      this.pyodide.runPythonAsync(secureCode)
        .then(() => {
          clearTimeout(this.executionTimeoutHandle);
          this.isExecuting = false;
          resolve(output);
        })
        .catch((error: any) => {
          clearTimeout(this.executionTimeoutHandle);
          this.isExecuting = false;
          
          const errorMessage = error.message || error.toString();
          
          // Manejo específico de límites
          if (errorMessage.includes('TIMEOUT_EXCEEDED')) {
            this.executionTimeout.emit();
            resolve('Se excedió el tiempo de ejecución');
          } else if (errorMessage.includes('OUTPUT_LIMIT_EXCEEDED')) {
            this.outputLimitExceeded.emit();
            resolve('Se excedió el límite de salida');
          } else if (errorMessage.includes('MEMORY_LIMIT_EXCEEDED')) {
            this.memoryExceeded.emit();
            resolve('Se excedió el límite de memoria');
          } else {
            // Error normal del código del usuario
            if (output.trim()) {
              resolve(`${output}\nError: ${this.extractUserFriendlyError(errorMessage)}`);
            } else {
              resolve(`Error: ${this.extractUserFriendlyError(errorMessage)}`);
            }
          }
        });
    });
  }

  private extractUserFriendlyError(errorMessage: string): string {
    // Extraer el error más relevante del traceback
    const lines = errorMessage.split('\n');
    
    // Buscar la línea que contiene el error real
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.startsWith('File ') && !line.startsWith('Traceback') && 
          !line.includes('During handling') && line !== '^') {
        // Limpiar errores comunes
        if (line.includes('SyntaxError:')) {
          return line.replace('SyntaxError:', 'Error de sintaxis:');
        } else if (line.includes('NameError:')) {
          return line.replace('NameError:', 'Error de nombre:');
        } else if (line.includes('TypeError:')) {
          return line.replace('TypeError:', 'Error de tipo:');
        } else if (line.includes('ValueError:')) {
          return line.replace('ValueError:', 'Error de valor:');
        } else if (line.includes('IndentationError:')) {
          return line.replace('IndentationError:', 'Error de indentación:');
        } else if (line.includes('ZeroDivisionError:')) {
          return 'Error: División por cero';
        } else if (line.includes('IndexError:')) {
          return line.replace('IndexError:', 'Error de índice:');
        } else if (line.includes('KeyError:')) {
          return line.replace('KeyError:', 'Error de clave:');
        }
        return line;
      }
    }
    
    // Si no encontramos nada específico, devolver el mensaje original limpio
    return errorMessage.split('\n').filter(line => 
      line.trim() && 
      !line.includes('File ') && 
      !line.includes('Traceback') &&
      !line.includes('During handling')
    ).pop() || 'Error desconocido';
  }

  async ejecutarCodigo(): Promise<void> {
    if (!this.pyodide) {
      this.output = 'Pyodide no está cargado correctamente.';
      this.codeOutput.emit(this.output);
      return;
    }

    if (this.isExecuting) {
      this.stopExecution();
      return;
    }

    if (!this.codigo.trim()) {
      this.output = 'No hay código para ejecutar.';
      this.codeOutput.emit(this.output);
      return;
    }

    try {
      this.output = '';
      this.output = await this.executeCodeWithLimits(this.codigo);
      
      // Emitir eventos
      this.codeOutput.emit(this.output);
      this.codeExecuted.emit({code: this.codigo, output: this.output});
      
    } catch (error: any) {
      const errorMessage = String(error.message || error);
      this.output = `Error inesperado: ${errorMessage}`;
      this.codeOutput.emit(this.output);
      this.codeExecuted.emit({code: this.codigo, output: this.output});
    }
  }

  // Función para verificar solución (modo actividad) con límites
  async verificarSolucion(): Promise<void> {
    if (!this.correctSolution) {
      console.warn('No se ha proporcionado una solución correcta');
      return;
    }

    if (!this.pyodide) {
      this.output = 'Pyodide no está cargado correctamente.';
      this.codeOutput.emit(this.output);
      return;
    }

    try {
      // Ejecutar el código del usuario con límites
      this.output = '';
      const userOutput = await this.executeCodeWithLimits(this.codigo);
      this.output = userOutput;
      
      // Si el output contiene mensajes de límite excedido, marcar como incorrecto
      const isLimitExceeded = userOutput.includes('Se excedió el tiempo') ||
                              userOutput.includes('Se excedió el límite') ||
                              userOutput.includes('Ejecución detenida');
      
      if (isLimitExceeded) {
        this.codeOutput.emit(this.output);
        this.solutionCheck.emit({correct: false, output: this.output});
        return;
      }
      
      // Ejecutar la solución correcta (también con límites por seguridad)
      const correctOutput = await this.executeCodeWithLimits(this.correctSolution);
      
      // Comparar salidas (normalizar espacios en blanco)
      const normalizeOutput = (str: string) => {
        return str.trim()
                  .replace(/\s+/g, ' ')
                  .replace(/\n\s*\n/g, '\n'); // Normalizar saltos de línea múltiples
      };
      
      const normalizedUserOutput = normalizeOutput(userOutput);
      const normalizedCorrectOutput = normalizeOutput(correctOutput);
      
      const isCorrect = normalizedUserOutput === normalizedCorrectOutput;
      
      // Emitir eventos
      this.codeOutput.emit(this.output);
      this.solutionCheck.emit({correct: isCorrect, output: this.output});
      
    } catch (error: any) {
      const errorMessage = String(error.message || error);
      this.output = `Error: ${errorMessage}`;
      this.codeOutput.emit(this.output);
      this.solutionCheck.emit({correct: false, output: this.output});
    }
  }

  // Función para restablecer el código
  restablecerCodigo(): void {
    this.codigo = this.initialCode;
    this.output = '';
    this.codeChange.emit(this.codigo);
    this.codeOutput.emit('');
  }

  chat(): void {
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