import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwtModel } from 'libs/index';

export const KeyIndex = 'index';

type NumberSet = number | null | undefined;
type StringSet = string | null | undefined;

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _userId = '';
  private _preferences: Record<string, string | number | null | undefined> | null = null;

  constructor(private jwtHelper: JwtHelperService) {}

  async getString(key: string, defaultValue: StringSet): Promise<StringSet> {
    await this.getPreferences();
    const toReturn = this._preferences?.[key];
    if (toReturn === undefined) {
      await this.setString(key, defaultValue);
      return defaultValue;
    } else {
      return toReturn as StringSet;
    }
  }

  async getNumber(key: string, defaultValue: NumberSet): Promise<NumberSet> {
    await this.getPreferences();
    const toReturn = this._preferences?.[key];
    if (toReturn === undefined) {
      await this.setNumber(key, defaultValue);
      return defaultValue;
    } else {
      return toReturn as NumberSet;
    }
  }

  async setString(key: string, value: StringSet) {
    await this.getPreferences();
    this._preferences![key] = value;
    await this.savePreferences();
  }

  async setNumber(key: string, value: NumberSet) {
    await this.getPreferences();
    this._preferences![key] = value;
    await this.savePreferences();
  }

  private async getUserId() {
    const jwt: JwtModel | null = await this.jwtHelper.decodeToken();
    if (jwt === null) {
      return 'ANON';
    } else {
      return jwt.userId;
    }
  }

  private async getPreferences() {
    const userId = await this.getUserId();
    if (userId !== this._userId) {
      this.loadPreferences(userId);
    } else {
      // continue
    }
  }

  private loadPreferences(userId: string) {
    const rawPreferences = localStorage.getItem(userId);
    if (rawPreferences === null) {
      this._preferences = {};
    } else {
      this._preferences = JSON.parse(rawPreferences);
    }
    this._userId = userId;
  }

  private async savePreferences() {
    localStorage.setItem(await this.getUserId(), JSON.stringify(this._preferences));
  }
}
