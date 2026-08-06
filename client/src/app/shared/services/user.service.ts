import { Injectable, inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tokenGetter, tokenSetter } from '../../app.config';
import { BehaviorSubject } from 'rxjs';
import { JwtModel } from 'libs/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private jwtHelper = inject(JwtHelperService);
  private api = inject(ApiService);

  loggedIn$ = new BehaviorSubject<boolean>(false);

  private jwt: JwtModel | null = null;

  get userId() {
    return this.jwt?.userId ?? 'ANON';
  }

  get username() {
    return this.jwt?.username ?? '?';
  }

  get initial() {
    return this.username[0];
  }

  get canEdit$() {
    return this.loggedIn$;
  }

  constructor() {
    const isLoggedIn = this.isLoggedIn();
    this.loggedIn$.next(isLoggedIn);
    if (isLoggedIn) {
      this.jwt = this.jwtHelper.decodeToken(tokenGetter());
      void this.loadClubAccess();
    } else {
      // Do nothing
    }
  }

  logout() {
    tokenSetter('');
    this.loggedIn$.next(false);
    this.jwt = null;
    void this.loadClubAccess();
  }

  login(token: string) {
    tokenSetter(token);
    this.loggedIn$.next(true);
    this.jwt = this.jwtHelper.decodeToken(tokenGetter());
    void this.loadClubAccess();
  }

  isLoggedIn(): boolean {
    return !this.jwtHelper.isTokenExpired();
  }

  async loadClubAccess() {
    const clubId = this.api.clubId;
    if (clubId) {
      this.api.unloadClub();
      this.api.fetchClub(clubId);
    } else {
      // Continue
    }
    this.api.fetchClubs();
  }
}
