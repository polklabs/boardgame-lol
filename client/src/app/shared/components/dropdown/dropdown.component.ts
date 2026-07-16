import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { ControlWrapperComponent } from '../control-wrapper/control-wrapper.component';
import { Select, SelectModule } from 'primeng/select';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dropdown',
  imports: [SelectModule, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
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
export class DropdownComponent<T> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @ViewChild(Select) dropdown!: Select;

  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();
  @Input() options$?: Observable<T[]>;
  @Input() options: T[] = [];
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

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}

  onModelChange(value: unknown): void {
    this.changed.emit(value);
  }

  onDropdownShow() {
    // This event handler will fire when the items panel is about to be shown
    setTimeout(() => {
      const p: HTMLElement = this.dropdown.el.nativeElement.querySelector('.p-select-overlay');

      if (p) {
        let itemsPanelHeight = p.offsetHeight;

        // Just to show what you can do
        p.setAttribute('style', 'border: 1px solid red !important');

        // Add a little space
        itemsPanelHeight += 3;

        p.style.top = '-' + itemsPanelHeight + 'px';
      }
    }, 1);
  }
}
