import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskCreate } from '../../../models/task.model';
import { TasksService, TaskCreateResponse } from '../../services/tasks.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit, OnDestroy {
  newTaskForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  maxFileSizeMB = 5;
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
  private destroy$ = new Subject<void>();

  users: any[] = [
    { name: "Mohamed", id: 1 },
    { name: "Ali", id: 2 },
    { name: "Ahmed", id: 3 },
    { name: "Zain", id: 4 },
  ];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialogRef<AddTaskComponent>,
    public matDialog: MatDialog,
    private tasksService: TasksService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    // Initialize form with fields that match TaskCreate interface
    this.newTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      deadline: ['', [Validators.required]],
      userId: ['', [Validators.required]],
      image: ['']
    });
  }

  ngOnInit(): void {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.newTaskForm.get('deadline')?.setValue(tomorrow);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!this.allowedFileTypes.includes(file.type)) {
        this.toastr.error('Invalid file type. Please upload JPG, PNG or GIF files.');
        input.value = '';
        return;
      }

      // Validate file size (5MB max)
      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        this.toastr.error(`File is too large. Maximum size is ${this.maxFileSizeMB}MB.`);
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.toastr.success('File selected successfully');
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return; // Prevent multiple submissions
    }

    if (this.newTaskForm.valid) {
      this.isSubmitting = true;

      // Create task data from form
      const taskData: TaskCreate = {
        title: this.newTaskForm.get('title')?.value,
        description: this.newTaskForm.get('description')?.value,
        deadline: this.formatDate(this.newTaskForm.get('deadline')?.value),
        userId: this.newTaskForm.get('userId')?.value,
      };

      // Add image if selected
      if (this.selectedFile) {
        taskData.image = this.selectedFile;
      }

      // Show loading spinner
      this.spinner.show();

      // Subscribe to create task service
      this.tasksService.createTask(taskData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.spinner.hide();
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response: TaskCreateResponse) => {
            this.toastr.success(response.message || 'Task created successfully');
            this.dialog.close(response);
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.toastr.error(error.message || 'Failed to create task');
          }
        });
    } else {
      // Show validation errors
      this.toastr.warning('Please fix the form errors before submitting');

      // Mark all fields as touched to trigger validation messages
      Object.keys(this.newTaskForm.controls).forEach(field => {
        const control = this.newTaskForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  // Helper method to get error message for a form control
  getErrorMessage(controlName: string): string {
    const control = this.newTaskForm.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Minimum length is ${requiredLength} characters`;
    }

    if (control.errors['maxlength']) {
      const requiredLength = control.errors['maxlength'].requiredLength;
      return `Maximum length is ${requiredLength} characters`;
    }

    return 'Invalid input';
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';

    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
