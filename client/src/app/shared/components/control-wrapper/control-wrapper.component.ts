import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { getMinMax, getNullable } from 'libs/index';

@Component({
  selector: 'app-control-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-wrapper.component.html',
  styleUrl: './control-wrapper.component.scss',
})
export class ControlWrapperComponent {
  @Input() controlName!: string;
  @Input() formGroup!: FormGroup;
  @Input() label?: string;
  @Input() hiddenFields: Set<string> = new Set();
  @Input() entityType?: unknown;
  @Input() textInputType = 'text';
  @Input() iconPosition = 'right';

  constructor() {}

  isShown(): boolean {
    return this.hiddenFields.has(this.controlName) === false;
  }

  isFieldInvalid(): boolean {
    const control = this.formGroup.get(this.controlName);
    return (control?.touched ?? true) && !!control?.errors;
  }

  getFieldLabel(): string {
    return this.label ?? this.controlName;
  }

  isRequired(): boolean {
    if (this.formGroup.get(this.controlName)?.hasValidator(Validators.required)) {
      return true;
    } else {
      // continue
    }

    if (!getNullable(this.entityType).includes(this.controlName)) {
      return true;
    } else {
      // continue
    }

    return false;
  }

  getErrorText(): string {
    const control = this.formGroup.get(this.controlName);
    if (control) {
      if (control.errors?.['nullable']) {
        return 'Field is required';
      } else if (control.errors?.['minMax']) {
        const value = control.value;
        const minMax = getMinMax(this.entityType)[this.controlName];
        if (this.textInputType === 'text') {
          if (value.length < minMax.min) {
            return `${value.length}/${minMax.max} Minimum Length: ${minMax.min}`;
          } else {
            return `${value.length}/${minMax.max} Exceeds Character Limit`;
          }
        } else if (this.textInputType === 'number') {
          if (value < minMax.min) {
            return `Minimum Value: ${minMax.min}`;
          } else {
            return `Maximum Value: ${minMax.max}`;
          }
        } else {
          return '';
        }
      } else if (control.errors?.['passwordCommon']) {
        return 'Do not use common passwords';
      } else if (control.errors?.['unavailable']) {
        return 'Username is taken';
      } else if (control.errors?.['mismatch']) {
        return 'Passwords do not match';
      } else if (control.errors?.['minlength']) {
        return `Minimum Length: ${control.errors?.['minlength'].requiredLength}`;
      } else if (control.errors?.['required']) {
        return 'Field is required';
      } else if (control.errors?.['email']) {
        return 'Enter an email address';
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getLengthText(): string {
    if (!this.entityType) {
      return '';
    } else {
      // continue
    }

    const minMax = getMinMax(this.entityType)[this.controlName];
    const value = this.formGroup.get(this.controlName)?.value ?? '';
    if (minMax && this.textInputType === 'text') {
      return `${value.length}/${minMax.max}`;
    } else {
      return '';
    }
  }
}
