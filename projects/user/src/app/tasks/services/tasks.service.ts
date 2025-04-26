import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private baseUrl = environment.baseApi; // Base API endpoint from environment

  constructor(private http: HttpClient) { }

  // Add your methods here for tasks management
}
