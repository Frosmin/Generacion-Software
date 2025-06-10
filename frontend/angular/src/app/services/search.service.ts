// src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id: number;
  title: string;
  link: string;
  level: number;
}

export interface Exercise {
  id: number;
  title: string;
  exercise: string;
  solution: string;
  level: number;
}

export interface Tutorial {
  id: number;
  title: string;
  description: string;
  level: number;
}

export interface SearchResult {
  videos: Video[];
  exercises: Exercise[];
  tutorials: Tutorial[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = 'http://localhost:8080/api'; // Cambia según tu backend

  constructor(private http: HttpClient) {}

  searchByName(name: string): Observable<SearchResult> {
    return this.http.get<SearchResult>(`${this.baseUrl}/search`, {
      params: { name },
    });
  }
}
