import { Component, EventEmitter, Input, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CheckboxModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hiddenFields = new Set<string>();
  @Output() changed = new EventEmitter<boolean>();

  value = false;
  disabled = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  get inputId(): string {
    return `${this.ngControl.name ?? ''}`;
  }

  constructor(@Optional() @Self() private ngControl: NgControl) {
    if (this.ngControl) {
      // Tell Angular this component is the value accessor
      this.ngControl.valueAccessor = this;
      // this.formControl = this.ngControl.control;
    } else {
      console.error('Component failed to find NgControl on itself at runtime!');
    }
  }

  writeValue(value: boolean | null): void {
    this.value = value ?? false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(checked: boolean): void {
    this.value = checked;
    this.onChange(checked);
    this.onTouched();
    this.changed.emit(checked);
  }

  getFieldLabel(): string {
    return this.label ?? this.inputId;
  }

  isShown(): boolean {
    return this.hiddenFields.has(this.inputId) === false;
  }
}
