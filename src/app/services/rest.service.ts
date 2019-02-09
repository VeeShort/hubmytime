import { Injectable } from "@angular/core";
import { LoginCred } from "../interface/Login";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";

@Injectable()
export class RestService {
  private readonly API_URL: string = 'https://api.hubstaff.com/v1';
  private readonly APP_TOKEN: string = 'R0cDtib8jxQmdZ2J87kqR7qYP3XCRkh6XZ7MM3V219Y';
  private AUTH_TOKEN: string;

  constructor(
    private _http: HttpClient
  ) {}

  public setAuthToken(token: string): void {
    this.AUTH_TOKEN = token;
  }

  public requestLogin(body: LoginCred): Promise<any> {
    const options: any = {
      headers: {
        'App-Token': this.APP_TOKEN
      }
    };
    return this._http.post(`${this.API_URL}/auth`, body, options)
    .toPromise()
    .catch(this._handleError);
  }

  private _handleError(err: any): void {
    console.error(err);
  }
}