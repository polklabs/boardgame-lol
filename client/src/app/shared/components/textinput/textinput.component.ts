import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';

@Component({
  selector: 'app-textinput',
  standalone: true,
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
export class TextInputComponent implements ControlValueAccessor {
  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();
  @Input() inputType = 'text';

  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'right';

  get formGroup() {
    return this.formGroupDirective.form;
  }

  constructor(private formGroupDirective: FormGroupDirective) {}

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}  
}
