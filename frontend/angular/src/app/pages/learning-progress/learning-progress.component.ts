import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Course {
  id: number;
  title: string;
  progress: number;
  modules: number;
  completedModules: number;
  image: string;
  lastAccessed: Date;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedDate: Date;
}

@Component({
  selector: 'app-learning-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-progress.component.html',
  styleUrls: ['./learning-progress.component.scss'],
})
export class LearningProgressComponent implements OnInit {
  username = 'Usuario';
  totalProgress = 0;
  courses: Course[] = [];
  achievements: Achievement[] = [];
  activeCourses = 0;
  completedCourses = 0;

  ngOnInit(): void {
    this.username = 'Alex';
    this.loadSampleCourses();
    this.loadAchievements();
    this.calculateOverallProgress();
    this.countActiveCourses();
  }

  private loadSampleCourses(): void {
    this.courses = [
      {
        id: 1,
        title: 'Fundamentos de Python',
        progress: 75,
        modules: 8,
        completedModules: 6,
        image: 'assets/images/curso-python.png',
        lastAccessed: new Date(2025, 4, 10),
      },
      {
        id: 2,
        title: 'Estructuras de datos en Python',
        progress: 40,
        modules: 10,
        completedModules: 4,
        image: 'assets/images/curso-python.png',
        lastAccessed: new Date(2025, 4, 12),
      },
      {
        id: 3,
        title: 'Programación Orientada a Objetos',
        progress: 20,
        modules: 12,
        completedModules: 2,
        image: 'assets/images/curso-python.png',
        lastAccessed: new Date(2025, 4, 8),
      },
      {
        id: 4,
        title: 'Desarrollo Web con Flask',
        progress: 0,
        modules: 15,
        completedModules: 0,
        image: 'assets/images/curso-python.png',
        lastAccessed: new Date(),
      },
    ];
  }

  private loadAchievements(): void {
    this.achievements = [
      {
        id: 1,
        title: 'Primer código',
        description: 'Completaste tu primer programa "Hola Mundo"',
        icon: 'trophy',
        earnedDate: new Date(2025, 4, 1),
      },
      {
        id: 2,
        title: 'Experto en Variables',
        description: 'Dominaste el uso de variables y tipos de datos',
        icon: 'star',
        earnedDate: new Date(2025, 4, 3),
      },
      {
        id: 3,
        title: 'Bucles Conquistados',
        description: 'Completaste todos los ejercicios de bucles',
        icon: 'medal',
        earnedDate: new Date(2025, 4, 7),
      },
    ];
  }

  calculateOverallProgress(): void {
    if (this.courses.length === 0) {
      this.totalProgress = 0;
      return;
    }
    const total = this.courses.reduce((sum, c) => sum + c.progress, 0);
    this.totalProgress = Math.round(total / this.courses.length);
  }

  countActiveCourses(): void {
    this.activeCourses = this.courses.filter(
      (c) => c.progress > 0 && c.progress < 100
    ).length;
    this.completedCourses = this.courses.filter(
      (c) => c.progress === 100
    ).length;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
