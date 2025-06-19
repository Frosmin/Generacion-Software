import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'; // ✅ Importado

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.scss',
})
export class ExerciseComponent {
  @Input() detail: { id: number; title: string; statement: string } = {
    id: 0,
    title: '',
    statement: '',
  };

  sliceLength = 130; // ✅ Valor por defecto para pantallas grandes

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver // ✅ Inyectado
  ) {
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
      ])
      .subscribe((result) => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.sliceLength = 55;
        } else if (result.breakpoints[Breakpoints.Small]) {
          this.sliceLength = 100;
        } else if (result.breakpoints[Breakpoints.Medium]) {
          this.sliceLength = 115;
        } else {
          this.sliceLength = 130;
        }
      });
  }

  navigateToExercise() {
    this.router.navigate(['/exercise', this.detail.id]);
  }

  convertir(valor: string): string {
    if (valor.length >= 40) {
      return valor.slice(0, 40) + '...';
    }
    return valor;
  }
}
