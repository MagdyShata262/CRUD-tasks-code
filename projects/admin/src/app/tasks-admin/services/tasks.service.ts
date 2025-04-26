import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task, TaskResponse, TaskCreate, TaskUpdate } from '../../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private baseUrl = environment.baseApi.replace('/tasks', '/tasks'); // Maintain the tasks endpoint

  constructor(private http: HttpClient) { }

  /**
   * Fetch all tasks from the API.
   * @returns An Observable containing the list of tasks.
   */
  getAllTasks(filters?: any): Observable<TaskResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.title) {
        params = params.append('title', filters.title);
      }
      if (filters.userId) {
        params = params.append('userId', filters.userId);
      }
      if (filters.status) {
        params = params.append('status', filters.status);
      }
      if (filters.fromDate) {
        const formattedFromDate = new Date(filters.fromDate).toISOString().split('T')[0];
        params = params.append('fromDate', formattedFromDate);
      }
      if (filters.toDate) {
        const formattedToDate = new Date(filters.toDate).toISOString().split('T')[0];
        params = params.append('toDate', formattedToDate);
      }
    }

    return this.http.get<TaskResponse>(`${this.baseUrl}/all-tasks`, { params });
  }

  /**
   * Create a new task
   * @param taskData The task data to be created
   * @returns An Observable containing the created task response
   */
  createTask(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add-task`, formData);
  }

  /**
   * Update an existing task
   * @param taskId The ID of the task to be updated
   * @param formData FormData object containing updated task information and file
   * @returns An Observable containing the updated task response
   */

  updateTask(taskId: string, formData: FormData): Observable<{ success: boolean; message: string }> {
    // Validate inputs
    if (!taskId?.trim()) {
      const errorMsg = 'Task ID is required for updating';
      console.error('Update task failed:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    if (!this.isValidFormData(formData)) {
      const errorMsg = 'Valid form data is required for updating';
      console.error('Update task failed:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    const url = `${this.baseUrl}/edit-task/${encodeURIComponent(taskId)}`;
    console.log(`Attempting to update task with ID: ${taskId}`);

    return this.http.put<{ success: boolean; message: string }>(url, formData).pipe(
      tap((response) => {
        console.log(`Task ${taskId} updated successfully:`, response.message);
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMsg = this.getErrorMessage(error, taskId);
        console.error(`Failed to update task ${taskId}:`, errorMsg, error);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  private isValidFormData(formData: FormData | null | undefined): boolean {
    if (!formData) return false;

    // Check if FormData has any entries
    let hasEntries = false;
    formData.forEach(() => { hasEntries = true; });
    return hasEntries;

    // Alternative check:
    // return Array.from(formData.entries()).length > 0;
  }

  private getErrorMessage(error: HttpErrorResponse, taskId: string): string {
    if (error.status === 404) {
      return `Task not found (ID: ${taskId}). It may have been deleted.`;
    }
    if (error.status === 403) {
      return 'You do not have permission to update this task.';
    }
    if (error.status === 400) {
      return 'Invalid request data. Please check your input.';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return `Failed to update task ${taskId}. Please try again.`;
  }
  /**
   * Delete a task by ID with enhanced error handling
   * @param taskId The ID of the task to be deleted
   * @param showConfirmation Whether to show a confirmation dialog before deleting
   * @returns An Observable containing the delete operation response
   * @throws Error if taskId is empty or invalid
   */
  deleteTask(taskId: string, showConfirmation: boolean = true): Observable<{ success: boolean, message: string }> {
    if (!taskId) {
      console.error('Delete task failed: Task ID is required');
      return throwError(() => new Error('Task ID is required for deletion'));
    }

    // URL construction with proper path
    const url = `${this.baseUrl}/delete-task/${taskId}`;

    console.log(`Attempting to delete task with ID: ${taskId}`);

    return this.http.delete<{ success: boolean, message: string }>(url).pipe(
      tap(response => {
        console.log('Task deleted successfully:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Failed to delete task ${taskId}:`, error);

        let errorMessage = 'Failed to delete task';

        if (error.status === 404) {
          errorMessage = 'Task not found. It may have been already deleted.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to delete this task.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get a task by ID
   * @param taskId The ID of the task to be retrieved
   * @returns An Observable containing the retrieved task
   */
  getTaskById(taskId: string): Observable<{ task: Task }> {
    return this.http.get<{ task: Task }>(`${this.baseUrl}/${taskId}`);
  }

  /**
   * Get all available users
   * @returns An Observable containing the list of users
   */
  // getAllUsers(): Observable<any> {
  //   return this.http.get<any>(`${environment.baseApi.replace('/tasks', '/users')}/all-users`);
  // }

  /**
   * Get all available task statuses
   * @returns An Observable containing the list of task statuses
   */
  // getTaskStatuses(): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/statuses`);
  // }

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
