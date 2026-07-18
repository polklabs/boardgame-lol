import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, forwardRef, inject } from '@angular/core';
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
import { getMinMax } from 'libs/index';
import { ControlBase } from '../../models/control.base';
import { SortPipe } from "../../pipes/sort.pipe";

@Component({
  selector: 'app-multi-select',
  imports: [MultiSelectModule, ButtonModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent, SortPipe],
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
export class MultiSelectComponent<T, K> extends ControlBase<T, K> implements ControlValueAccessor, OnInit {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() showClear = false;
  @Input() showFilter = false;
  @Input() maxSelectedLabels: number | null = null;
  @Input() selectedItemsLabel: string | undefined;
  @Input() selectionLimit: number | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  private onChange: (value: K[]) => void = () => {};
  private onTouched: () => void = () => {};

  get formGroup() {
    return this.formGroupDirective.form;
  }

  ngOnInit(): void {
    const minMax = getMinMax(this.entityType)[this.formControlName];
    if (minMax && this.selectionLimit === null) {
      this.selectionLimit = minMax.max || null;
    } else {
      // Use provided limit
    }
  }

  writeValue(): void {
    // Stub
  }

  registerOnChange(fn: (value: K[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onModelChange(value: unknown): void {
    this.changed.emit(value);
  }

  onFocus(event: MultiSelectFocusEvent) {
    event.originalEvent.stopImmediatePropagation();
  }
}
