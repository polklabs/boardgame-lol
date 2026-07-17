import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';
import { ControlBase } from '../../models/control.base';

@Component({
  selector: 'app-textarea',
  imports: [TextareaModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
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
export class TextareaComponent<T> extends ControlBase<T, unknown> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() rows = '5';
  @Input() cols = '30';

  // @Output() changed = new EventEmitter<string>();

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}

  // onModelChange(value: string): void {
  //   // this.changed.emit(value);
  // }
}
