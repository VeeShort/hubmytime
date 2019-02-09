import { Injectable } from "@angular/core";
import { User } from "../interface/User";

@Injectable()
export class UserService {
  public user: User;

  constructor() {}
}