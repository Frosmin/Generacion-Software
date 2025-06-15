import { Component } from '@angular/core';
import introductionMock from './introduccionMock.json';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-introduction',
  imports: [MatButtonModule],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})

export class IntroductionComponent {
  curso: any = null;
  intro = introductionMock;
  initialSubject = 0;
  totalSubjects = this.intro.length - 1;

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
