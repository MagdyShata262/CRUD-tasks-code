import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angulartasks';

  constructor(
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    // Initial spinner hide after app loads
    this.spinner.hide();
  }
}
