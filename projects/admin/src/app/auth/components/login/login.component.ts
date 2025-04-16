import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // If already logged in, redirect to tasks
    this.loginService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/tasks']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.loginService.login(email, password).subscribe(
      response => {
        this.loading = false;
        if (response.error) {
          this.errorMessage = response.error;
        } else {
          this.router.navigate(['/tasks']);
        }
      },
      error => {
        this.loading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    );
  }
}
