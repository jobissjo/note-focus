import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  protected http = inject(HttpClient);
  protected apiUrl = environment.apiUrl;

  protected get<T>(path: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${path}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  protected post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, body).pipe(
      catchError(this.handleError)
    );
  }

  protected patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${path}`, body).pipe(
      catchError(this.handleError)
    );
  }

  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${path}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // Here we could trigger a toast notification
    return throwError(() => new Error(errorMessage));
  }
}
