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
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-calendar',
  imports: [DatePickerModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true,
    },
  ],
})
export class CalendarComponent implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();

  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'right';
  @Input() showClear = false;

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}
}
