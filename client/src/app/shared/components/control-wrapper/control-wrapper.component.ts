import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { getIgnore } from 'libs/decorators/ignore.decorator';
import { getMinMax, getNullable, getPattern, MinMaxValue } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-control-wrapper',
  imports: [FloatLabelModule, InputGroupModule, InputGroupAddonModule, ButtonModule],
  templateUrl: './control-wrapper.component.html',
  styleUrl: './control-wrapper.component.scss',
})
export class ControlWrapperComponent implements OnInit {
  @Input() controlName!: string;
  @Input() formGroup!: FormGroup;
  @Input() label?: string;
  @Input() hiddenFields: Set<string> = new Set();
  @Input() entityType?: unknown;
  @Input() textInputType = 'text';
  @Input() iconPosition = 'right';
  @Input() locked = false;

  lockSet = false;

  constructor() {}

  ngOnInit(): void {
    if (this.locked) {
      this.formGroup.controls[this.controlName].disable();
      this.lockSet = true;
    } else {
      // Do nothing
    }
  }

  toggleDisabled() {
    const control = this.formGroup.controls[this.controlName];
    if (control.disabled) {
      control.enable();
      this.lockSet = false;
    } else {
      control.disable();
      this.lockSet = true;
    }
  }

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

    if (
      !getNullable(this.entityType).includes(this.controlName) &&
      !getIgnore(this.entityType).includes(this.controlName)
    ) {
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
          if (value.length < (minMax.min ?? -Infinity)) {
            return `${value.length}/${minMax.max} Minimum Length: ${minMax.min}`;
          } else {
            return `${value.length}/${minMax.max} Exceeds Character Limit`;
          }
        } else if (this.textInputType === 'array') {
          if (value.length < (minMax.min ?? -Infinity)) {
            return `${this.lengthText(minMax, value)} Minimum Length: ${minMax.min}`;
          } else {
            return `${this.lengthText(minMax, value)} Exceeds Limit`;
          }
        } else if (this.textInputType === 'number') {
          if (value < (minMax.min ?? -Infinity)) {
            return `Minimum Value: ${minMax.min}`;
          } else {
            return `Maximum Value: ${minMax.max}`;
          }
        } else {
          return '';
        }
      } else if (control.errors?.['pattern']) {
        const pattern = getPattern(this.entityType)[this.controlName];
        return `Does not match ${pattern.desc}`;
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
    if (
      minMax?.min !== undefined &&
      minMax?.max !== undefined &&
      (this.textInputType === 'text' || this.textInputType === 'array')
    ) {
      return this.lengthText(minMax, value);
    } else {
      return '';
    }
  }

  private lengthText(minMax: MinMaxValue, value: string | unknown[]) {
    if (minMax.max === undefined) {
      return `${value.length}`;
    } else {
      return `${value.length}/${minMax.max}`;
    }
  }
}
