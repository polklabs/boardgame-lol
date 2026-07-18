import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';
import { SelectModule } from 'primeng/select';
import { ControlBase } from '../../models/control.base';
import { SortPipe } from "../../pipes/sort.pipe";

@Component({
  selector: 'app-dropdown',
  imports: [SelectModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent, SortPipe],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent<T, K> extends ControlBase<T, K> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() showClear = false;
  @Input() showFilter = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}

  onModelChange(value: unknown): void {
    this.changed.emit(value);
  }
}
