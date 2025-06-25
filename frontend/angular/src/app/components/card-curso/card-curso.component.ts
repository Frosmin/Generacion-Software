import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ICardCurso } from '../../shared/interfaces/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-curso',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterModule],
  templateUrl: './card-curso.component.html',
  styleUrl: './card-curso.component.scss',
})
export class CardCursoComponent {
  @Input() content!: ICardCurso;

  constructor(private router: Router) {}

  onEdit(event: MouseEvent) {
    event.stopPropagation(); // Evita que también se dispare el routerLink general
    this.router.navigate(['/editar-curso', this.content.id]);
  }
}
