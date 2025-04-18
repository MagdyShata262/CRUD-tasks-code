import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginService } from '../auth/services/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private loginService: LoginService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the token from LoginService
    const token = this.loginService.getToken();

    // Only log and add authentication for API requests, not for assets or other resources
    if (this.isApiRequest(request.url)) {
      // Enhanced token logging
      if (token) {
        console.log('%c Auth Token: ', 'background: #222; color: #bada55; font-size: 14px');
        console.log('%c ' + token, 'background: #f0f0f0; color: #0066cc; font-size: 12px');
        console.log('URL:', request.url);
      } else {
        console.log('%c No Auth Token Found for API request', 'background: #222; color: #f88; font-size: 14px');
        console.log('URL:', request.url);
      }

      // If token exists, add it to the request headers
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    // Handle the request and catch any authentication errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized response, redirect to login
        if (error.status === 401) {
          this.loginService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  // Helper method to check if a request is going to our API
  private isApiRequest(url: string): boolean {
    return url.includes('localhost:8080') || url.includes('/api/');
  }
}
