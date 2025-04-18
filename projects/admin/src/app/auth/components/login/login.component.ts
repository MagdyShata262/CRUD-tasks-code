import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['admin']
    });
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const payload = this.loginForm.value; // Extract form values

    this.spinner.show();

    this.loginService.login(payload).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.errorMessage = error.error.message;
        this.toastr.error(this.errorMessage);
        this.loading = false;
        this.spinner.hide();
      },
      complete: () => {
        this.toastr.success('Login successful');
        this.loading = false;
        this.spinner.hide();
      }
    });
  }
}
