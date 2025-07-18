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
import { CursosComponent } from './pages/cursos/cursos.component';
import { IntroductionComponent } from './pages/introduction/introduction.component';
import { ChatComponent } from './pages/chat/chat.component';
import { CreateCourseComponent } from './pages/create-course/create-course.component';
import { EditCourseComponent } from './pages/edit-course/edit-course.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },



  { path: 'intro', component: IntroductionComponent},
  { path: 'cursos', component: CursosComponent},
  { path: 'buscador', component: PaginaBuscadorComponent },
  { path: 'lista-videos', component: VideosListComponent },
  { path: 'lista-ejercicios', component: ExercisesListComponent },
  { path: 'exercise/:id', component: SeeExerciseComponent },
  { path: 'lista-cursos', component: CoursesListComponent },
  { path: 'terminal', component: TerminalComponent },
  { path: 'cursos/:id', component: IntroductionComponent },
  { path: 'editar-curso/:id', component: EditCourseComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'crear-curso', component: CreateCourseComponent },

      // rutas protegidas
  { path: 'progreso-aprendizaje', component: LearningProgressComponent, canMatch: [authGuard]}
];
