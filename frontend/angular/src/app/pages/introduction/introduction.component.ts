import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import introductionMock from './dataCursos/introduccionMock.json';
import flujosMock from './dataCursos/flujosMock.json';
import funcionesMock from './dataCursos/funcionesMock.json';
import estructurasMock from './dataCursos/estructurasMock.json';
import pooMock from './dataCursos/pooMock.json';
import archivosMock from './dataCursos/archivosMock.json';
import { MatButtonModule } from '@angular/material/button';
import { EditorActividadComponent } from '../../components/editor-actividad/editor-actividad.component';
import { SearchComponent } from '../../components/search/search.component';
import { ContenidoCurso, CursoDisponible } from './interfaces'; 

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, EditorActividadComponent, SearchComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})
export class IntroductionComponent {
  curso: ContenidoCurso | null = null;
  resetCnt = 0;
  salidaCodigo = '';
  currentMock: ContenidoCurso[] = [];
  initialSubject = 0;
  totalSubjects = 0;
  content: ContenidoCurso | null = null;
  allCursos: string[] = [];

  
  cursosDisponibles: CursoDisponible[] = [
    { nombre: 'Introducción', mock: introductionMock as ContenidoCurso[] },
    { nombre: 'Flujos de Control', mock: flujosMock as ContenidoCurso[] },
    { nombre: 'Funciones', mock: funcionesMock as ContenidoCurso[] },
    { nombre: 'Estructuras de Datos', mock: estructurasMock as ContenidoCurso[] },
    { nombre: 'POO', mock: pooMock as ContenidoCurso[] },
    { nombre: 'Archivos', mock: archivosMock as ContenidoCurso[] }
  ];

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadMock(id);
    });
  }

  loadMock(id: string): void {
    switch(id) {
      case 'intro':
        this.currentMock = introductionMock as ContenidoCurso[];
        break;
      case 'flujos':
        this.currentMock = flujosMock as ContenidoCurso[];
        break;
      case 'funciones':
        this.currentMock = funcionesMock as ContenidoCurso[];
        break;
      case 'datos':
        this.currentMock = estructurasMock as ContenidoCurso[];
        break;
      case 'poo':
        this.currentMock = pooMock as ContenidoCurso[];
        break;
      case 'files':
        this.currentMock = archivosMock as ContenidoCurso[];
        break;
      default:
        this.currentMock = introductionMock as ContenidoCurso[];
    }

    this.initialSubject = 0;
    this.totalSubjects = this.currentMock.length - 1;
    this.content = this.currentMock[this.initialSubject];
    this.allCursos = this.currentMock.map(e => e.title);
    this.resetCnt++;
  }

  gonext(): void {
    if (this.initialSubject < this.totalSubjects) {
      this.initialSubject++;
      this.update();
    }
  }

  goback(): void {
    if (this.initialSubject > 0) {
      this.initialSubject--;
      this.update();
    }
  }

  update(): void {
    this.content = this.currentMock[this.initialSubject];
    this.resetCnt++;
  }

  handleSelection(index: number): void {
    this.initialSubject = index;
    this.update();
  }

  cambiarCurso(mock: ContenidoCurso[]): void {
    this.currentMock = mock;
    this.initialSubject = 0;
    this.totalSubjects = this.currentMock.length - 1;
    this.content = this.currentMock[this.initialSubject];
    this.allCursos = this.currentMock.map(e => e.title);
    this.resetCnt++;
  }
}