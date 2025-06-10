import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ExercisesListComponent } from './pages/exercises-list/exercises-list.component';
import { VideosListComponent } from './pages/videos-list/videos-list.component';
import { PaginaBuscadorComponent } from './pages/pagina-buscador/pagina-buscador.component';
import { LearningProgressComponent } from './pages/learning-progress/learning-progress.component';
import { CoursesListComponent } from './pages/courses-list/courses-list.component';
import { TerminalComponent } from './pages/terminal/terminal.component';
import { SeeExerciseComponent } from './pages/see-exercise/see-exercise.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },




  // rutas protegidas
  { path: 'buscador', component: PaginaBuscadorComponent },
  { path: 'lista-videos', component: VideosListComponent },
  { path: 'lista-ejercicios', component: ExercisesListComponent },
  { path: 'exercise/:id', component: SeeExerciseComponent },
  { path: 'progreso-aprendizaje', component: LearningProgressComponent, canMatch: [authGuard] },
  { path: 'lista-cursos', component: CoursesListComponent },
  { path: 'terminal', component: TerminalComponent },

];
