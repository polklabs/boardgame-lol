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
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { newGuid, TagEntity } from 'libs/index';

@Component({
  selector: 'app-tags',
  imports: [AutoCompleteModule, AutoComplete, ReactiveFormsModule, FormsModule, CommonModule, ControlWrapperComponent],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsComponent),
      multi: true,
    },
  ],
})
export class TagsComponent implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() formControlName!: string;
  @Input() label?: string;
  @Input() entityType: unknown;
  @Input() hiddenFields = new Set<string>();
  @Input() options: TagEntity[] = [];
  @Input() placeholder?: string;
  @Input() showClear = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  items: TagEntity[] = [];

  private onChange: (value: TagEntity[]) => void = () => {};
  private onTouched: () => void = () => {};

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {}

  registerOnChange(fn: (value: TagEntity[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onModelChange(value: unknown): void {
    this.changed.emit(value);
  }

  onKeydown(event: Event, autocomplete: AutoComplete) {
    if (autocomplete.overlayVisible) {
      this.search({
        query: (event.target as HTMLInputElement).value,
        originalEvent: event,
      });
    } else {
      // Skip
    }
  }

  search(event: AutoCompleteCompleteEvent) {
    const control = this.formGroup.controls[this.formControlName];
    const values = control.value as TagEntity[];
    if (event.query) {
      this.items = this.options.filter(
        (x) => !values.includes(x) && x.Text?.toLowerCase().includes(event.query.toLowerCase()),
      );
    } else {
      this.items = this.options.filter((x) => !values.includes(x));
    }
  }

  add() {
    const control = this.formGroup.controls[this.formControlName];
    const values = control.value.map((v: string | TagEntity) => {
      if (typeof v === 'string') {
        return new TagEntity({ Text: v, TagId: newGuid() });
      } else {
        return v;
      }
    });
    control.setValue(values);
    control.updateValueAndValidity();
  }
}
