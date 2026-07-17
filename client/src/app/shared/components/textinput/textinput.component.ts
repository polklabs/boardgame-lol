import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';
import { ControlBase } from '../../models/control.base';

@Component({
  selector: 'app-textinput',
  imports: [InputTextModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
  templateUrl: './textinput.component.html',
  styleUrl: './textinput.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
})
export class TextInputComponent<T> extends ControlBase<T, unknown> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() inputType = 'text';

  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'right';

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}
}
