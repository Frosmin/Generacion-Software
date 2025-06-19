// src/app/pages/cursos/cursos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardCursoComponent } from '../../components/card-curso/card-curso.component';
import { ICardCurso } from '../../shared/interfaces/interfaces';
import { CoursesService } from '../../services/courses.service';

@Component({
  selector: 'app-cursos',
  imports: [CardCursoComponent, CommonModule],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss',
})
export class CursosComponent implements OnInit {
  cursos: ICardCurso[] = [];
  loading = true;
  error: string | null = null;

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.coursesService.getBasicCourses().subscribe({
      next: (courses) => {
        this.cursos = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
        this.error = 'Error al cargar los cursos. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}