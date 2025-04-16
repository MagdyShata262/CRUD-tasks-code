import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router, private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    // In a real app, this would make an HTTP request to authenticate
    // For demo purposes, we're just checking against hardcoded values
    if (email === 'admin@example.com' && password === 'password') {
      const mockResponse = {
        user: { id: 1, email, role: 'admin' },
        token: 'mock-jwt-token'
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      this.isAuthenticatedSubject.next(true);

      return of(mockResponse);
    }

    return of({ error: 'Invalid credentials' });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
