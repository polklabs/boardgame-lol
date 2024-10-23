import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [DropdownModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
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
export class DropdownComponent implements ControlValueAccessor {
  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();
  @Input() options: unknown[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() placeholder?: string;
  @Input() showClear = false;
  @Input() showFilter = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  get formGroup() {
    return this.formGroupDirective.form;
  }

  constructor(private formGroupDirective: FormGroupDirective) {}

  writeValue(): void {
  }

  registerOnChange(): void {
  }

  registerOnTouched(): void {
  }

  onModelChange(value: unknown): void {
    this.changed.emit(value);
  }
}
