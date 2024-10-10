import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextInputComponent } from '../shared/components/textinput/textinput.component';
import { PasswordComponent } from '../shared/components/password/password.component';
import { DialogModule } from 'primeng/dialog';
import { HttpService } from '../shared/services/http.service';
import { minMaxValidator } from '../shared/validators/min-max.validator';
import { UserEntity } from 'libs/index';
import { passwordCommonValidator } from '../shared/validators/password-common.validator';
import { passwordMatchValidator } from '../shared/validators/password-match.validator';
import { MessageService } from 'primeng/api';

type PassChangePost = { CurrentPassword: string; Password: string };

@Component({
  selector: 'app-password-update',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TextInputComponent,
    PasswordComponent,
    DialogModule,
  ],
  templateUrl: './password-update.component.html',
  styleUrl: './password-update.component.scss',
})
export class PasswordUpdateComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();

  passChangeFormGroup!: FormGroup;
  commonPasswords: string[] = [];
  headerText = 'CHANGE PASSWORD';

  entityType = UserEntity;

  constructor(
    private httpService: HttpService,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.passChangeFormGroup = this.fb.group({
      CurrentPassword: [null, Validators.required],
      Password: [
        null,
        [Validators.required, minMaxValidator(UserEntity, 'Password')],
        passwordCommonValidator(this.httpService.get<string[]>(['auth', 'passwords_common'], true)),
      ],
      PasswordRetry: [null, [Validators.required, passwordMatchValidator()]],
    });
  }

  async changePassword() {
    this.passChangeFormGroup.markAllAsTouched();
    if (this.passChangeFormGroup.invalid) {
      return;
    } else {
      // continue
    }

    const loginData = await this.httpService.post<PassChangePost, boolean>(
      ['auth', 'change_password'],
      this.passChangeFormGroup.getRawValue(),
    );

    if (loginData) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Your password has been changed' });
      this.closeForm.emit();
    } else {
      // continue
    }
  }
}
