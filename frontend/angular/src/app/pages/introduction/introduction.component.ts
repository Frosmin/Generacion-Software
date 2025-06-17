import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import introductionMock from './introduccionMock.json';
import flujosMock from './flujosMock.json';
import funcionesMock from './funcionesMock.json';
import estructurasMock from './estructurasMock.json';
import pooMock from './pooMock.json';
import archivosMock from './archivosMock.json';
import { MatButtonModule } from '@angular/material/button';
import { EditorActividadComponent } from '../../components/editor-actividad/editor-actividad.component';
import { SearchComponent } from '../../components/search/search.component';

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, EditorActividadComponent, SearchComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})
export class IntroductionComponent {
  curso: any | null = null;
  resetCnt = 0;
  salidaCodigo = '';
  currentMock: any[] = [];
  initialSubject = 0;
  totalSubjects = 0;
  content: any;
  allCursos: string[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.loadMock(params['id']);
    });
  }

  loadMock(id: string) {
    switch(id) {
      case 'intro':
        this.currentMock = introductionMock;
        break;
      case 'flujos':
        this.currentMock = flujosMock;
        break;
      case 'funciones':
        this.currentMock = funcionesMock;
        break;
      case 'datos':
        this.currentMock = estructurasMock;
        break;
      case 'poo':
        this.currentMock = pooMock;
        break;
      case 'files':
        this.currentMock = archivosMock;
        break;
      default:
        this.currentMock = introductionMock;
    }

    this.initialSubject = 0;
    this.totalSubjects = this.currentMock.length - 1;
    this.content = this.currentMock[this.initialSubject];
    this.allCursos = this.currentMock.map((e) => e.title);
    this.resetCnt++;
  }

  gonext() { /* igual que lo tienes */ }
  goback() { /* igual que lo tienes */ }
  update() { this.content = this.currentMock[this.initialSubject]; }
  handleSelection(index: number) { this.initialSubject = index; this.update(); }
}
