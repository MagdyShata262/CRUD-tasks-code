import { Component, OnInit } from '@angular/core';
import { LoginService } from './auth/services/login.service';
import { JQueryService } from './services/jquery.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;


  constructor(
    private loginService: LoginService,
    private jqueryService: JQueryService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    // Initial spinner hide after app loads
    this.spinner.hide();
  }

  initializeNavbarToggler() {
    // Use jQuery to handle navbar toggle on mobile
    this.jqueryService.$('.navbar-toggler').on('click', () => {
      this.jqueryService.$('.navbar-collapse').toggleClass('show');
    });
  }

  logout() {
    this.spinner.show();
    this.loginService.logout();
    this.spinner.hide();
  }
}
