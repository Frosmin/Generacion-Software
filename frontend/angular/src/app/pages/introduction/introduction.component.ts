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
  intro = introductionMock;
  initialSubject = 0;
  totalSubjects = this.intro.length - 1;
  salidaCodigo = '';
  content = this.intro[this.initialSubject];

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
  }

  handleSelection(index: number) {
    this.initialSubject = index;
    this.update();
  }
}
