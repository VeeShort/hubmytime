import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestService } from './services/rest.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private rest: RestService
  ) {}

  ngOnInit() {
    const token: string = localStorage.getItem('auth_token');
    if (token) {
      this.rest.setAuthToken(token);
      this.router.navigate(['/dashboard']);
    }
    else this.router.navigate(['/login']);
  }
}
