import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TasksService } from '../../services/tasks.service';
import { Task, TaskResponse } from '../../../models/task.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil, interval, switchMap, startWith, Observable, throwError, tap, catchError } from 'rxjs';

export interface PeriodicElement {
  title: string;
  user: string;
  deadLineDate: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { status: 'Complete', title: 'Hydrogen', user: "1.0079", deadLineDate: "10-11-2022" },
  { status: 'In-Prossing', title: 'Helium', user: "4.0026", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Lithium', user: "6.941", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Beryllium', user: "9.0122", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Boron', user: "10.811", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Carbon', user: "12.010", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Nitrogen', user: "14.006", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Oxygen', user: "15.999", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Fluorine', user: "18.998", deadLineDate: "10-11-2022" },
  { status: 'Complete', title: 'Neon', user: "20.179", deadLineDate: "10-11-2022" },
];

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'image', 'title', 'user', 'deadLineDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  tasksFilter: FormGroup;
  isLoading = false;

  users: any[] = [];
  status: any[] = [];

  // Pagination settings
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Auto refresh
  autoRefreshEnabled = false;
  autoRefreshInterval = 30; // seconds
  private refreshTrigger$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  // View options
  viewMode: 'list' | 'grid' = 'list';

  defaultTaskImage = 'assets/images/default-task.png';
  @Inject(MAT_DIALOG_DATA) public data: any // Inject the task data

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private tasksService: TasksService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    // public dialogRef: MatDialogRef<AddTaskComponent>,
  ) {
    this.tasksFilter = this.fb.group({
      title: [this.data?.title || ''],
      userId: [this.data?.userId?._id || ''],
      status: [this.data?.status || ''],
      fromDate: [this.data?.fromDate || ''],
      toDate: [this.data?.toDate || ''],
      image: [this.data?.image || '']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilterListeners();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Listen for sort changes
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        // Reset pagination to first page when sorting
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.applyFilters();
      });
    }
  }

  loadInitialData(): void {

    this.getAllTasks();
  }



  setupAutoRefresh(): void {
    // Set up auto-refresh using a combination of interval and subject
    interval(this.autoRefreshInterval * 1000)
      .pipe(
        takeUntil(this.destroy$),
        // Only refresh when autoRefreshEnabled is true
        switchMap(() => this.autoRefreshEnabled ? [true] : [])
      )
      .subscribe(() => {
        this.refreshTrigger$.next();
      });

    // Listen to manual refresh triggers and auto-refresh
    this.refreshTrigger$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300) // Debounce to prevent multiple rapid refreshes
      )
      .subscribe(() => {
        this.getAllTasks(this.tasksFilter.value);
      });
  }

  setupFilterListeners() {
    // Listen to title search changes with debounce
    this.tasksFilter.get('title')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.applyFilters();
      });

    // Listen to other filter changes
    this.tasksFilter.get('userId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetPagination();
        this.applyFilters();
      });

    this.tasksFilter.get('status')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetPagination();
        this.applyFilters();
      });

    // Date range changes
    this.tasksFilter.get('fromDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.tasksFilter.get('fromDate')?.value) {
          this.resetPagination();
          this.applyFilters();
        }
      });

    this.tasksFilter.get('toDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.tasksFilter.get('toDate')?.value) {
          this.resetPagination();
          this.applyFilters();
        }
      });
  }

  resetPagination(): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.currentPage = 0;
    }
  }

  applyFilters() {
    const filterValue = this.tasksFilter.value;
    // Add pagination info to filters
    const filters = {
      ...filterValue,
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add sorting if active
    if (this.sort && this.sort.active) {
      filters.sortBy = this.sort.active;
      filters.sortDirection = this.sort.direction;
    }

    this.getAllTasks(filters);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.applyFilters();
  }

  getAllTasks(filters?: any) {
    this.isLoading = true;
    this.spinner.show();

    this.tasksService.getAllTasks(filters).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (res: TaskResponse) => {
        console.log(res);
        this.dataSource.data = res.tasks;
        this.totalItems = res.totalItems;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to load tasks');
      }
    });
  }

  /**
   * Delete a task with confirmation dialog
   * @param taskId The ID of the task to delete
   */
  deleteTask(taskId: string) {
    if (!taskId) {
      this.toastr.error('Cannot delete task: Missing task ID');
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      this.spinner.show();

      this.tasksService.deleteTask(taskId, false).pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.spinner.hide();
        })
      ).subscribe({
        next: (response) => {
          this.toastr.success(response.message || 'Task deleted successfully');
          this.manualRefresh(); // Use the existing refresh method
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to delete task');
        }
      });
    }
  }


  updateTask(task: Task | string, formData?: FormData): Observable<any> | void {
    // Handle case when called from template with full task object
    if (typeof task !== 'string') {
      return this.openTaskDialogForUpdate(task);
    }

    // Handle case when called programmatically with just ID and formData
    if (formData) {
      return this.directTaskUpdate(task, formData);
    }

    // Fallback error handling
    console.error('Invalid parameters for updateTask');
    return throwError(() => new Error('Invalid parameters for updateTask'));
  }

  private directTaskUpdate(taskId: string, formData: FormData): Observable<any> {
    if (!taskId) {
      return throwError(() => new Error('Task ID is required'));
    }

    if (!formData || !this.hasFormDataEntries(formData)) {
      return throwError(() => new Error('Form data is required'));
    }

    return this.tasksService.updateTask(taskId, formData).pipe(
      tap(() => {
        this.toastr.success('Task updated successfully');
        this.refreshTasks();
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private hasFormDataEntries(formData: FormData): boolean {
    // Method 1: Using forEach
    let hasEntries = false;
    formData.forEach(() => hasEntries = true);
    return hasEntries;

    // Method 2: Alternative using entries()
    // const entries = Array.from(formData.entries());
    // return entries.length > 0;
  }

  /**
   * Opens a dialog for updating a task
   * @param task The task object to update
   */
  private openTaskDialogForUpdate(task: Task): void {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '750px',
      disableClose: true,
      data: task
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllTasks();
      }
    });
  }

  // ... rest of the methods remain unchanged ...


/**
 * Centralized error display
 */
private showError(message: string, context?: any): void {
  console.error(message, context);
  this.toastr.error(message);
}

/**
 * Refreshes task list based on current filters
 */
private refreshTasks(): void {
  if (this.autoRefreshEnabled) {
    this.refreshTrigger$.next();
  } else {
    this.applyFilters();
  }
}

  addTask() {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '750px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllTasks();
      }
    });
  }

  resetFilters() {
    this.tasksFilter.reset();
    this.resetPagination();
    this.getAllTasks();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return this.defaultTaskImage;
    }

    // Check if the image path is a full URL or a relative path
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Construct the URL using the base API URL
    return `http://localhost:8080/${imagePath}`;
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.toastr.info(`Auto-refresh enabled. Refreshing every ${this.autoRefreshInterval} seconds.`);
      // Trigger an immediate refresh
      this.refreshTrigger$.next();
    } else {
      this.toastr.info('Auto-refresh disabled');
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  manualRefresh(): void {
    this.refreshTrigger$.next();
    this.toastr.info('Refreshing data...');
  }
}
