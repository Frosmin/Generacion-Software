import { Component } from '@angular/core';
import introductionMock from './introduccionMock.json';
import { MatButtonModule } from '@angular/material/button';
import { SearchComponent } from '../../components/search/search.component';
import { EditorComponent } from '../../shared/editor/editor.component'; 

interface Curso {
  instrucciones: string;
  codigo_incompleto: string;
  solucion_correcta: string;
}

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, SearchComponent, EditorComponent], 
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})
export class IntroductionComponent {
  curso: Curso | null = null;
  resetCnt = 0;
  intro = introductionMock;
  initialSubject = 0;
  totalSubjects = this.intro.length - 1;
  salidaCodigo = '';
  content = this.intro[this.initialSubject];
  resultadoVerificacion = '';

  allCursos = this.intro.map((e) => {
    return e.title;
  });

  gonext() {
    this.initialSubject++;
    this.resetCnt++;
    this.update();
  }

  goback() {
    this.initialSubject--;
    this.resetCnt++;
    this.update();
  }

  update() {
    this.content = this.intro[this.initialSubject];
    this.cargarEjercicio();
  }

  cargarEjercicio() {
   
    if (this.initialSubject === 0) {
      this.curso = {
        instrucciones: 'Crea un comentario y luego imprime "Hola mundo"',
        codigo_incompleto: '# Escribe tu comentario aquí\n# Completa el código\n',
        solucion_correcta: '# Este es mi comentario\nprint("Hola mundo")'
      };
    } else if (this.initialSubject === 1) {
      this.curso = {
        instrucciones: 'Crea dos variables: una numérica (x) y una de texto (y), luego imprímelas',
        codigo_incompleto: '# Crea las variables aquí\nx = \ny = \n# Imprime las variables\n',
        solucion_correcta: 'x = 5\ny = "Juan"\nprint(x)\nprint(y)'
      };
    } else {
      this.curso = {
        instrucciones: 'Realiza el ejercicio según lo aprendido en esta lección.',
        codigo_incompleto: '# Escribe tu código aquí\n',
        solucion_correcta: 'print("Ejercicio completado")'
      };
    }
  }

  handleSelection(index: number) {
    this.initialSubject = index;
    this.update();
  }


  onCodeOutput(output: string) {
    this.salidaCodigo = output;
  }


  onSolutionCheck(result: {correct: boolean, output: string}) {
    if (result.correct) {
      this.resultadoVerificacion = '¡Correcto! ✅';
    } else {
      this.resultadoVerificacion = 'Incorrecto. Inténtalo de nuevo. ❌';
    }
    this.salidaCodigo = result.output;
  }

  ngOnInit() {
    this.cargarEjercicio();
  }
}