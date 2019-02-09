import { Component } from "@angular/core";
import { RestService } from "../services/rest.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public doRemember: boolean = false;
  public disableSubmit: boolean = false;

  public email: string;
  public password: string;

  constructor(
    private rest: RestService,
    private router: Router
  ) { }

  public requestLogin(): void {
    this.disableSubmit = true;
    this.email = this.email.trim();
    this.password = this.password.trim();
    const { email, password } = this;
    this.rest.requestLogin({ email, password })
    .then(res => {
      this.disableSubmit = false;
      if (res && res.user && res.user.auth_token) {
        this.rest.setAuthToken(res.user.auth_token);
        if (this.doRemember)
          localStorage.setItem('auth_token', res.user.auth_token);
        this.router.navigate(['/dashboard']);
      } else console.error('[autoLogin] Server returned no data');
    }).catch(err => {
      console.error(err);
      this.disableSubmit = false;
    });
  }

}