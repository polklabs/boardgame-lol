import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, inject, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';
import { DatePickerModule } from 'primeng/datepicker';
import { endOfDay } from 'date-fns';
import { ControlBase } from '../../../models/control.base';

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
export class CalendarComponent<T> extends ControlBase<T, unknown> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'right';
  @Input() showClear = false;
  @Input() maxDate: Date | null = endOfDay(new Date());
  readonly range = input(false);

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}
}
