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

export interface AuthResponse {
  token: string;
  userId: number;
  user: {
    id: number;
    email: string;
    role: string;
    name?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/auth/login'; // API endpoint
  // private currentUserSubject = new BehaviorSubject<any>(this.getUserFromLocalStorage());
  // public currentUser = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router, private http: HttpClient) {
    // Check token validity on service initialization
    if (this.hasToken()) {
      this.validateToken();
    }
  }

  login(payload: LoginRequest): Observable<any> {
    return this.http.post<AuthResponse>(this.apiUrl, payload).pipe(
      tap((response) => {
        // Store token and user in localStorage
        this.storeUserData(response);

        // Update authentication state
        // this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map((response) => {
        console.log('Login successful:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update authentication state
    // this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // getCurrentUser(): Observable<any> {
  //   return this.currentUser;
  // }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper methods
  private storeUserData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token);
    // localStorage.setItem('user', JSON.stringify(authData.user));
  }

  // private getUserFromLocalStorage(): any {
  //   const userData = localStorage.getItem('user');
  //   return userData ? JSON.parse(userData) : null;
  // }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private validateToken(): void {
    // This would typically call a backend endpoint to verify token validity
    // For now, we'll just check if the token exists
    const tokenExists = this.hasToken();
    this.isAuthenticatedSubject.next(tokenExists);

      // if (!tokenExists) {
      //   this.currentUserSubject.next(null);
      // }
  }
}
