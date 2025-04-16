import { Component, OnInit } from '@angular/core';
import { LoginService } from './auth/services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginService.isAuthenticated().subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  logout() {
    this.loginService.logout();
  }
}
