import { Component } from '@angular/core';
import introductionMock from './introduccionMock.json';
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
  resetCnt = 0;
  curso: any = null;  
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
