import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ControlBase } from '../../models/control.base';

@Component({
  selector: 'app-password',
  imports: [PasswordModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent, DividerModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordComponent),
      multi: true,
    },
  ],
})
export class PasswordComponent<T> extends ControlBase<T, unknown> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() feedback = false;

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}

  hasLengthError(): boolean {
    const control = this.formGroup.get(this.formControlName);
    if (control) {
      if (control.errors?.['minMax']) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  hasCommonError(): boolean {
    const control = this.formGroup.get(this.formControlName);
    if (control) {
      if (control.errors?.['passwordCommon']) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
