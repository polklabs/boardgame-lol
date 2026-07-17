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
import { BoardGameEntity } from 'libs/index';
import { InputNumberModule } from 'primeng/inputnumber';
import { ControlBase } from '../../models/control.base';

@Component({
  selector: 'app-number-input',
  imports: [InputNumberModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
})
export class NumberInputComponent<T> extends ControlBase<T, unknown> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() locked = false;

  @Input() boardGame?: BoardGameEntity | null;
  @Input() prefix?: string | null;
  @Input() suffix?: string | null;
  @Input() maxFractionDigits = 10;

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}
}
