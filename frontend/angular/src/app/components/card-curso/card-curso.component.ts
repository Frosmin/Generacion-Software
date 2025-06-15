import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ICardCurso } from '../../shared/interfaces/interfaces';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-curso',
  imports: [MatCardModule, MatButtonModule, RouterModule],
  templateUrl: './card-curso.component.html',
  standalone: true,
  styleUrl: './card-curso.component.scss',
})
export class CardCursoComponent {
  @Input() content!: ICardCurso;
}
