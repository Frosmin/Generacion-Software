// src/app/services/courses.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ICardCurso } from '../shared/interfaces/interfaces';

// Interface para la respuesta básica de la API
interface BasicCourseResponse {
  id: number;
  title: string;
  description: string;
  goto: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly baseUrl = 'http://localhost:8080/api'; 

  constructor(private http: HttpClient) {}

  getBasicCourses(): Observable<ICardCurso[]> {
    return this.http.get<BasicCourseResponse[]>(`${this.baseUrl}/courses/info`).pipe(
      map(response => 
        response.map(course => ({
          id: course.id,       
          title: course.title,
          description: course.description,
          goto: course.goto
        }))
      )
    );
  }

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/courses`);
  }
}