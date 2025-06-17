import { Component } from '@angular/core';
import introductionMock from './introduccionMock.json';
import { MatButtonModule } from '@angular/material/button';
import { EditorActividadComponent } from '../../components/editor-actividad/editor-actividad.component';
interface Curso {
  instrucciones: string;
  codigo_incompleto: string;
  solucion_correcta: string;
}
@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, EditorActividadComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})

export class IntroductionComponent {
  curso: Curso | null = null;
  intro = introductionMock;
  initialSubject = 0;
  totalSubjects = this.intro.length - 1;
  salidaCodigo = '';
  title = this.intro[this.initialSubject].title;

  gonext() {
    this.initialSubject++;
    this.update();
  }

  goback() {
    this.initialSubject--;
    this.update();
  }

  update() {
    this.title = this.intro[this.initialSubject].title;
  }
}
