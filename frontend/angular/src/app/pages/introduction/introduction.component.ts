import { Component } from '@angular/core';
import introductionMock from './introduccionMock.json';
import { MatButtonModule } from '@angular/material/button';
import { EditorActividadComponent } from '../../components/editor-actividad/editor-actividad.component';

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule, EditorActividadComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})

export class IntroductionComponent {
  curso: any = null;
  intro = introductionMock;
  initialSubject = 0;
  totalSubjects = this.intro.length - 1;
  salidaCodigo: string = '';
  content = this.intro[this.initialSubject];

  gonext() {
    this.initialSubject++;
    this.update();
  }

  goback() {
    this.initialSubject--;
    this.update();
  }

  update() {
    this.content = this.intro[this.initialSubject];
  }
}
