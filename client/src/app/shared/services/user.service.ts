import { Injectable, inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tokenGetter, tokenSetter } from '../../app.config';
import { BehaviorSubject } from 'rxjs';
import { ClubEntity, JwtModel } from 'libs/index';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private jwtHelper = inject(JwtHelperService);
  private httpService = inject(HttpService);

  loggedIn$ = new BehaviorSubject<boolean>(false);
  accessIds$ = new BehaviorSubject<ClubEntity[]>([]);
  adminIds$ = new BehaviorSubject<string[]>([]);

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
      void this.loadClubAdminAccess();
    } else {
      // Do nothing
    }
  }

  logout() {
    tokenSetter('');
    this.loggedIn$.next(false);
    this.jwt = null;
    this.accessIds$.next([]);
  }

  login(token: string) {
    tokenSetter(token);
    this.loggedIn$.next(true);
    this.jwt = this.jwtHelper.decodeToken(tokenGetter());
    void this.loadClubAccess();
    void this.loadClubAdminAccess();
  }

  isLoggedIn(): boolean {
    return !this.jwtHelper.isTokenExpired();
  }

  async loadClubAccess() {
    let data = (await this.httpService.get<ClubEntity[]>(['auth', 'club_access'])) ?? [];
    data = data.map((x) => new ClubEntity(x));
    data.forEach((x) => x.calculate());
    this.accessIds$.next(data);
  }

  async loadClubAdminAccess() {
    this.adminIds$.next((await this.httpService.get(['auth', 'club_access_admin'])) ?? []);
  }
}
