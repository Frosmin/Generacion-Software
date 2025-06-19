import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.scss'],
})
export class BuscadorComponent {
  filtro = '';

  programadores = [
    {
      nombre: 'Carlos',
      categoria: 'Frontend',
      curso: 'Angular',
      imagen: '/images/Angular.png',
    },
    {
      nombre: 'Lucía',
      categoria: 'Backend',
      curso: 'Node.js',
      imagen: '/images/Nodejs.png',
    },
    {
      nombre: 'Pedro',
      categoria: 'Fullstack',
      curso: 'NestJS',
      imagen: '/images/nest.jpg',
    },
    {
      nombre: 'Ana',
      categoria: 'Frontend',
      curso: 'React',
      imagen: '/images/react.png',
    },
  ];

  get resultadosFiltrados() {
    const f = this.filtro.toLowerCase();
    return this.programadores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(f) ||
        p.categoria.toLowerCase().includes(f) ||
        p.curso.toLowerCase().includes(f)
    );
  }
}
