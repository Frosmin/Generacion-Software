import { Component } from '@angular/core';
import introductionMock from './introduccionMock.json';
import flujosMock from './flujosMock.json';
import funcionesMock from './funcionesMock.json';
import estructurasMock from './estructurasMock.json';
import pooMock from './pooMock.json';
import archivosMock from './archivosMock.json';
import { MatButtonModule } from '@angular/material/button';
import { EditorActividadComponent } from '../../components/editor-actividad/editor-actividad.component';
import { SearchComponent } from '../../components/search/search.component';

interface Curso {
  instrucciones: string;
  codigo_incompleto: string;
  solucion_correcta: string;
}

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, EditorActividadComponent, SearchComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})
export class IntroductionComponent {
  curso: Curso | null = null;
  resetCnt = 0;
  salidaCodigo = '';

  currentMock: any[] = introductionMock;
  initialSubject = 0;
  totalSubjects = this.currentMock.length - 1;
  content = this.currentMock[this.initialSubject];

  allCursos = this.currentMock.map((e) => e.title);

  cursosDisponibles = [
    { nombre: 'Introducción', mock: introductionMock },
    { nombre: 'Flujos', mock: flujosMock },
    { nombre: 'Funciones', mock: funcionesMock },
    { nombre: 'Estructuras', mock: estructurasMock },
    { nombre: 'POO', mock: pooMock },
    { nombre: 'Archivos', mock: archivosMock },
  ];

  cambiarCurso(mockSeleccionado: any[]) {
    this.currentMock = mockSeleccionado;
    this.initialSubject = 0;
    this.totalSubjects = this.currentMock.length - 1;
    this.content = this.currentMock[this.initialSubject];
    this.allCursos = this.currentMock.map((e) => e.title);
    this.resetCnt++;
  }

  gonext() {
    if (this.initialSubject < this.totalSubjects) {
      this.initialSubject++;
      this.resetCnt++;
      this.update();
    }
  }

  goback() {
    if (this.initialSubject > 0) {
      this.initialSubject--;
      this.resetCnt++;
      this.update();
    }
  }

  update() {
    this.content = this.currentMock[this.initialSubject];
  }

  handleSelection(index: number) {
    this.initialSubject = index;
    this.update();
  }
}
