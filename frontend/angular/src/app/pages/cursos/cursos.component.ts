import { Component } from '@angular/core';
import { CardCursoComponent } from '../../components/card-curso/card-curso.component';
import { ICardCurso } from '../../shared/interfaces/interfaces';
import cursosMock from './cursosMock.json';

@Component({
  selector: 'app-cursos',
  imports: [CardCursoComponent],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss',
})
export class CursosComponent {
  cursos: ICardCurso[] = cursosMock;
}
