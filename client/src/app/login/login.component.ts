import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpService } from '../shared/services/http.service';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { PasswordComponent } from '../shared/components/password/password.component';
import { Observable, catchError, delay, from, map, of, switchMap } from 'rxjs';
import { CountdownConfig, CountdownEvent, CountdownModule } from 'ngx-countdown';
import { minMaxValidator } from '../shared/validators/min-max.validator';
import { UserEntity } from 'libs/index';
import { UserService } from '../shared/services/user.service';
import { DialogModule } from 'primeng/dialog';

type LoginPost = { Username: string; Password: string; RememberMe: boolean; Verification?: string };
type LoginResp = { ok: boolean; access_token?: string; emojis?: string[] };

type SignupPost = { Email: string; Username: string; Password: string };

type ResetPassPost = { Username: string; Password?: string; Verification?: string };
type ResetPassResp = { ok: boolean; emojis?: string[] };

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    DividerModule,
    TextInputComponent,
    PasswordComponent,
    CountdownModule,
    DialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  @Output() closeLogin = new EventEmitter<void>();

  loginFormGroup!: FormGroup;
  signupFormGroup!: FormGroup;
  passResetFormGroup!: FormGroup;

  entityType = UserEntity;

  commonPasswords: string[] = [];

  view: 'login' | 'signup' | 'forgot_pass' | 'forgot_pass_verify' | 'forgot_pass_new' | 'email_verify' = 'login';

  emailEmojis: string[] = [];
  emailEmojisVerified: string[] = ['_', '_', '_', '_'];

  passEmojis: string[] = [];
  passEmojisVerified: string[] = ['_', '_', '_', '_'];

  usernameIcon = '';

  countdownConfig: CountdownConfig = {
    leftTime: 900,
    format: 'mm:ss',
  };

  countdownDone = false;

  headerText = 'LOGIN';

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const g = control.parent as FormGroup;
    if (g === null) {
      return null;
    } else {
      // continue
    }
    if (g.get('Password')?.value === null || g.get('PasswordRetry')?.value === null) {
      return null;
    } else {
      return g.get('Password')?.value === g.get('PasswordRetry')?.value ? null : { mismatch: true };
    }
  }

  passwordCommonValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === null) {
      return null;
    } else {
      return this.commonPasswords.includes(control.value) ? { passwordCommon: true } : null;
    }
  }

  emojiValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === null) {
      return null;
    } else {
      return control.value.includes('_') ? { badEmoji: true } : null;
    }
  }

  usernameUnique(control: AbstractControl): Observable<ValidationErrors | null> {
    this.usernameIcon = 'pi pi-spin pi-spinner';
    return of(control.value).pipe(
      delay(500),
      switchMap((username) => {
        this.usernameIcon = 'pi pi-spin pi-spinner';
        return from(this.httpService.get<boolean>(['aut', 'username_check', username], false)).pipe(
          map((isAvail) => {
            this.usernameIcon = isAvail ? 'pi pi-check' : 'pi pi-times';
            return isAvail ? null : { unavailable: true };
          }),
          catchError(() => of(null)),
        );
      }),
    );
  }

  constructor(
    private httpService: HttpService,
    private userService: UserService,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loginFormGroup = this.fb.group({
      Username: [null, [Validators.required]],
      Password: [null, Validators.required],
      RememberMe: false,
      Verification: '',
    });

    this.signupFormGroup = this.fb.group({
      Email: [null, [Validators.required, Validators.email]],
      Username: [null, [Validators.required, minMaxValidator(UserEntity, 'Username')], this.usernameUnique.bind(this)],
      Password: [
        null,
        [Validators.required, minMaxValidator(UserEntity, 'Password'), this.passwordCommonValidator.bind(this)],
      ],
      PasswordRetry: [null, [Validators.required, this.passwordMatchValidator]],
    });

    this.passResetFormGroup = this.fb.group({
      Username: [null, Validators.required],
      Verification: '',
      Password: null,
      PasswordRetry: null,
    });
  }

  async changeView(view: typeof this.view) {
    switch (view) {
      case 'signup':
        this.headerText = 'SIGNUP';
        if (this.commonPasswords.length === 0) {
          this.commonPasswords = (await this.httpService.get<string[]>(['auth', 'passwords_common'], true)) ?? [];
        } else {
          // continue
        }
        break;
      case 'email_verify':
        this.headerText = 'VERIFY EMAIL';
        this.loginFormGroup.get('Verification')?.addValidators(this.emojiValidator);
        break;
      case 'forgot_pass':
        this.headerText = 'REQUEST PASSWORD RESET';
        this.passResetFormGroup.get('Verification')?.removeValidators(this.emojiValidator);
        break;
      case 'forgot_pass_verify':
        this.headerText = 'VERIFY IDENTITY';
        this.passResetFormGroup.get('Verification')?.addValidators(this.emojiValidator);
        break;
      case 'forgot_pass_new':
        this.headerText = 'RESET PASSWORD';
        if (this.commonPasswords.length === 0) {
          this.commonPasswords = (await this.httpService.get<string[]>(['auth', 'passwords_common'], true)) ?? [];
        } else {
          // continue
        }
        this.passResetFormGroup
          .get('Password')
          ?.addValidators([
            Validators.required,
            this.passwordCommonValidator.bind(this),
            minMaxValidator(UserEntity, 'Password'),
          ]);
        this.passResetFormGroup.get('PasswordRetry')?.addValidators([Validators.required, this.passwordMatchValidator]);
        break;
      case 'login':
        this.headerText = 'LOGIN';
        this.loginFormGroup.get('Verification')?.removeValidators(this.emojiValidator);
        break;
      default:
        this.headerText = 'How did you get here?';
        console.warn(`Unknown View: ${view}`);
        break;
    }
    this.view = view;
  }

  countdownEvent(event: CountdownEvent) {
    if (event.action === 'done') {
      this.countdownDone = true;
    } else {
      this.countdownDone = false;
    }
  }

  async signup() {
    this.signupFormGroup.markAllAsTouched();
    this.signupFormGroup.get('PasswordRetry')?.updateValueAndValidity();
    if (this.signupFormGroup.invalid) {
      return;
    } else {
      // continue
    }

    const success = await this.httpService.post<SignupPost, boolean>(
      ['auth', 'signup'],
      this.signupFormGroup.getRawValue(),
    );

    if (success === true) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account Created! Please Log In.' });
      this.loginFormGroup.get('Username')?.setValue(this.signupFormGroup.get('Username')?.value);
      this.loginFormGroup.get('Password')?.setValue(this.signupFormGroup.get('Password')?.value);
      this.changeView('login');
      this.login();
    } else {
      console.log('Could not log in');
    }
  }

  async resetPasswordRequest() {
    this.passResetFormGroup.markAllAsTouched();
    if (this.passResetFormGroup.invalid) {
      return;
    } else {
      // continue
    }

    const success = await this.httpService.post<ResetPassPost, ResetPassResp>(
      ['auth', 'reset_password_request'],
      this.passResetFormGroup.getRawValue(),
    );

    if (success?.ok === true && success.emojis) {
      this.messageService.add({
        severity: 'info',
        summary: 'Email Sent',
        detail: 'Check your inbox for a verification email',
      });
      this.passEmojis = success.emojis;
      this.changeView('forgot_pass_verify');
    } else {
      console.log('Could not request reset email');
    }
  }

  async resetPasswordCheck() {
    this.passResetFormGroup.get('Verification')?.setValue(this.passEmojisVerified.join(''));
    this.passResetFormGroup.get('Verification')?.updateValueAndValidity();

    this.passResetFormGroup.markAllAsTouched();
    if (this.passResetFormGroup.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Please fill in emojis',
      });
      return;
    } else {
      // continue
    }

    const success = await this.httpService.post<ResetPassPost, boolean>(
      ['auth', 'reset_password_check'],
      this.passResetFormGroup.getRawValue(),
    );

    if (success === true) {
      this.messageService.add({
        severity: 'success',
        summary: 'Reset Validated',
        detail: 'Enter your new password',
      });
      this.changeView('forgot_pass_new');
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Verification Code Invalid',
        detail: 'Please enter the code as it appears in your email.',
      });
    }
  }

  async resetPassword() {
    this.passResetFormGroup.markAllAsTouched();
    this.passResetFormGroup.get('PasswordRetry')?.updateValueAndValidity();
    if (this.passResetFormGroup.invalid) {
      return;
    } else {
      // continue
    }

    const success = await this.httpService.post<ResetPassPost, boolean>(
      ['auth', 'reset_password'],
      this.passResetFormGroup.getRawValue(),
    );

    if (success === true) {
      this.messageService.add({
        severity: 'success',
        summary: 'Password Reset',
        detail: 'Please login with your new password',
      });
      this.changeView('login');
    } else {
      console.log('Could not request reset email');
    }
  }

  async login() {
    this.loginFormGroup.markAllAsTouched();
    if (this.loginFormGroup.invalid) {
      return;
    } else {
      // continue
    }

    const loginData = await this.httpService.post<LoginPost, LoginResp>(
      ['auth', 'login'],
      this.loginFormGroup.getRawValue(),
    );

    if (loginData) {
      if (loginData.ok) {
        this.userService.login(loginData.access_token!);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Logged In' });
        this.closeLogin.emit();
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Email Sent',
          detail: 'Check your inbox for a verification email',
        });
        this.emailEmojis = loginData.emojis!;
        this.changeView('email_verify');
      }
    } else {
      console.log('Could not log in');
    }
  }

  enterEmoji(emoji: string, list: string[]) {
    const index = list.findIndex((x) => x === '_');
    if (index === -1) {
      return;
    } else {
      list[index] = emoji;
    }
  }

  clearEmoji(index: number, list: string[]) {
    list[index] = '_';
  }

  async loginWithVerify() {
    this.loginFormGroup.get('Verification')?.setValue(this.emailEmojisVerified.join(''));
    this.loginFormGroup.get('Verification')?.updateValueAndValidity();

    this.loginFormGroup.markAllAsTouched();
    if (this.loginFormGroup.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Please fill in emojis',
      });
      return;
    } else {
      // continue
    }

    const loginData = await this.httpService.post<LoginPost, LoginResp>(
      ['auth', 'login_verify'],
      this.loginFormGroup.getRawValue(),
    );

    if (loginData?.ok && loginData.access_token) {
      this.userService.login(loginData.access_token);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Logged In' });
      this.closeLogin.emit();
    } else {
      console.log('Could not log in');
    }
  }
}
