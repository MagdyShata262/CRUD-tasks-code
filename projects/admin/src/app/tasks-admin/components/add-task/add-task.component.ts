import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskCreate, TaskResponse } from '../../../models/task.model';
import { TasksService } from '../../services/tasks.service';
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
    { name: "Mohamed", id: "67ff8fc87aec83dab6ed9fd2" },
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

      // Create FormData directly in the component
      const formData = new FormData();

      // Add form fields to FormData
      formData.append('title', this.newTaskForm.get('title')?.value);
      formData.append('description', this.newTaskForm.get('description')?.value);

      // Format and append the deadline
      const deadlineValue = this.formatDate(this.newTaskForm.get('deadline')?.value);
      formData.append('deadline', deadlineValue);

      // Append the userId
      const userId = this.newTaskForm.get('userId')?.value;
      formData.append('userId', userId ? userId.toString() : '');

      // Add image if selected
      if (this.selectedFile) {
        formData.append('image', this.selectedFile, this.selectedFile.name);
        console.log('Appending file:', this.selectedFile.name, this.selectedFile.type, this.selectedFile.size);
      }

      // Log the form data for debugging
      console.log('Form data contents:');
      for (const pair of (formData as any).entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'image' ? 'File: ' + pair[1].name : pair[1]));
      }

      // Show loading spinner
      this.spinner.show();

      // Call task service with FormData
      this.tasksService.createTask(formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.spinner.hide();
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response: TaskResponse) => {
            this.toastr.success('Task created successfully');
            this.dialog.close(response);
          },
          error: (error: Error) => {
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
