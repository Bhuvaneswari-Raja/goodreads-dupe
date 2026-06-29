import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book, CreateBookPayload, LogSessionPayload } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = `${environment.apiUrl}/api/books`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.api);
  }

  getOne(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.api}/${id}`);
  }

  create(payload: CreateBookPayload): Observable<Book> {
    return this.http.post<Book>(this.api, payload);
  }

  logSession(id: number, payload: LogSessionPayload): Observable<Book> {
    return this.http.post<Book>(`${this.api}/${id}/sessions`, payload);
  }

  remove(id: number): Observable<Book> {
    return this.http.delete<Book>(`${this.api}/${id}`);
  }
}