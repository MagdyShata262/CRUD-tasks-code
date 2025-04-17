import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:8080/auth/login'; // API endpoint




  constructor(private router: Router, private http: HttpClient) { }



  login(payload: LoginRequest): Observable<any> {
    return this.http.post(this.apiUrl, payload).pipe(
      map((response) => {
        // Handle successful response
        console.log('Login successful:', response);
        return response;
      }),
      catchError((error) => {
        // Handle errors (e.g., invalid credentials)
        console.error('Login failed:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

}
