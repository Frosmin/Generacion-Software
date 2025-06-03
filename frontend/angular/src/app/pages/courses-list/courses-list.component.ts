import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-courses-list',
  imports: [CommonModule],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent {

  cursos = [
  {
    nombre: 'Carlos Gómez',
    categoria: 'Lenguaje de programación',
    curso: 'Python',
    imagen: '/images/Python.svg.png',
  },
  {
    nombre: 'Lucía Martínez',
    categoria: 'Lenguaje de programación',
    curso: 'JavaScript',
    imagen: '/images/Unofficial_JavaScript_logo_2.svg.png',
  },
  {
    nombre: 'Pedro López',
    categoria: 'Lenguaje de programación',
    curso: 'Java',
    imagen: '/images/La-historia-de-JavaScript.jpg',
  },
  {
    nombre: 'Ana Torres',
    categoria: 'Lenguaje de programación',
    curso: 'C#',
    imagen: '/images/imsages.png',
  },
  {
    nombre: 'Jorge Pérez',
    categoria: 'Lenguaje de programación',
    curso: 'C++',
    imagen: '/images/ISO_C++_Logo.svg.png',
  },
  {
    nombre: 'Laura Ruiz',
    categoria: 'Lenguaje de programación',
    curso: 'Ruby',
    imagen: '/images/hq720.jpg',
  },
  {
    nombre: 'Miguel Castro',
    categoria: 'Lenguaje de programación',
    curso: 'Go',
    imagen: '/images/4d60ef81-2e58-457f-97c7-ee8847663985.jpg',
  },
  {
    nombre: 'Sofía Ríos',
    categoria: 'Lenguaje de programación',
    curso: 'PHP',
    imagen: '/images/Curso-gratis-de-PHP.png',
  },
];
   descargarComoTxt(): void {
    const texto = document.getElementById('lorem-ipsum-text')?.innerText;
    
    if (texto) {
      const blob = new Blob([texto], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lorem-ipsum.txt'; 
      a.click();
      URL.revokeObjectURL(url);
    }
  }
 descargarComoPDF(): void {
  const texto = document.getElementById('lorem-ipsum-text')?.innerText;

  if (texto) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.text('Texto de ejemplo:', margin, 20);

    doc.setFontSize(12);

    const lineas = doc.splitTextToSize(texto, usableWidth);

    doc.text(lineas, margin, 30);

    doc.save('lorem-ipsum.pdf');
  }
}
}
