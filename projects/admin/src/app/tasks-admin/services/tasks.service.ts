import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task, TaskResponse, TaskCreate, TaskUpdate } from '../../models/task.model';

// Define a specific response type for task creation
export interface TaskCreateResponse {
  success: boolean;
  message: string;
  task?: Task;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private baseUrl = 'http://localhost:8080/tasks'; // Base API endpoint
  private apiUrl1 = this.baseUrl + '/all-tasks'; // API endpoint for all tasks
  private apiUrl2 = this.baseUrl + '/add-task'; // API endpoint for add task

  constructor(private http: HttpClient) { }

  /**
   * Fetch all tasks from the API.
   * @returns An Observable containing the list of tasks.
   */
  getAllTasks(): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(this.apiUrl1).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  /**
   * Create a new task
   * @param taskData The task data to be created
   * @returns An Observable containing the created task response
   */
  createTask(taskData: TaskCreate): Observable<TaskCreateResponse> {
    // For file uploads, we need to use FormData
    const formData = new FormData();

    // Append all task properties to the form data
    formData.append('title', taskData.title);
    formData.append('description', taskData.description);

    // Handle deadline - could be string or Date
    if (taskData.deadline) {
      const deadlineValue = typeof taskData.deadline === 'string'
        ? taskData.deadline
        : this.formatDate(new Date(taskData.deadline));
      formData.append('deadline', deadlineValue);
    }

    // Handle userId - ensure it's a string
    if (taskData.userId) {
      formData.append('userId', String(taskData.userId));
    }

    // Only append image if it exists
    if (taskData.image) {
      formData.append('image', taskData.image, taskData.image.name);
    }

    return this.http.post<TaskCreateResponse>(this.apiUrl2, formData).pipe(
      tap(response => console.log('Task created:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Format a date to YYYY-MM-DD format
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Error handling logic.
   * @param error The HttpErrorResponse object.
   * @returns An Observable that emits an error message.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error or CORS issue
      errorMessage = 'Network error - please check your connection';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized - please log in again';
    } else if (error.status === 400 && error.error?.message) {
      // Bad request with message from server
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server error: ${error.status} - ${error.message}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
