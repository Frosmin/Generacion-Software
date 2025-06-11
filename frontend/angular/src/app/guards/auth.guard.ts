import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

//elminado route y segments para evitar advertencias de variables no utilizadas
//export const authGuard: CanMatchFn = (route, segments) => {
export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  
  // Redirigir al login si el usuario no está autenticado
  router.navigate(['/login']);
  return false;
};