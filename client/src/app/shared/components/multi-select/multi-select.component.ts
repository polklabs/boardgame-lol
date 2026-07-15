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
import { ButtonModule } from 'primeng/button';
import { MultiSelectFocusEvent, MultiSelectModule } from 'primeng/multiselect';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-multi-select',
  imports: [MultiSelectModule, ButtonModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent<T> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();
  @Input() options$: Observable<T[]> = of([]);
  @Input() optionLabel?: keyof T & string;
  @Input() placeholder?: string;
  @Input() showClear = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {
    // Stub
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onModelChange(value: unknown): void {
    this.changed.emit(value);
  }

  onFocus(event: MultiSelectFocusEvent) {
    // if (this.isMobile) {
    event.originalEvent.stopImmediatePropagation();
    // }
  }
}
