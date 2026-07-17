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
import { TagEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { MultiSelectFocusEvent, MultiSelectModule } from 'primeng/multiselect';
import { TagComponent } from '../tag/tag.component';
import { EditorTagsComponent } from '../../../editors/editor-tags/editor-tags.component';
import { ControlBase } from '../../models/control.base';

@Component({
  selector: 'app-tags',
  imports: [
    MultiSelectModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ControlWrapperComponent,
    TagComponent,
    EditorTagsComponent,
  ],
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
export class TagsComponent<T> extends ControlBase<T, unknown> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() showClear = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  editorTagsVisible = false;

  private onChange: (value: TagEntity[]) => void = () => {};
  private onTouched: () => void = () => {};

  get formGroup() {
    return this.formGroupDirective.form;
  }

  writeValue(): void {
    // Stub
  }

  registerOnChange(fn: (value: TagEntity[]) => void): void {
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
