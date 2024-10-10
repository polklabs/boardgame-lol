import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [InputTextareaModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();
  @Input() rows = '5';
  @Input() cols = '30';

  // @Output() changed = new EventEmitter<string>();

  get formGroup() {
    return this.formGroupDirective.form;
  }

  constructor(private formGroupDirective: FormGroupDirective) {}

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}

  // onModelChange(value: string): void {
  //   // this.changed.emit(value);
  // }
}
