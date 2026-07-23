import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, forwardRef, inject } from '@angular/core';
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
import { Subscription } from 'rxjs';

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
export class TagsComponent<T> extends ControlBase<T, TagEntity> implements ControlValueAccessor, OnChanges, OnDestroy {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() showClear = false;
  @Input() editorValue: (keyof TagEntity) | '' = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() changed = new EventEmitter<any>();

  tagOptions: TagEntity[] = [];

  editorTagsVisible = false;

  subscriptions = new Subscription();

  private onChange: (value: TagEntity[]) => void = () => {};
  private onTouched: () => void = () => {};

  get formGroup() {
    return this.formGroupDirective.form;
  }

  ngOnChanges(): void {
    if (this.options$) {
      this.subscriptions.add(
        this.options$.subscribe((options) => {
          this.tagOptions = options;
          this.updateTagOptions();
        }),
      );
    } else {
      this.tagOptions = this.options ?? [];
      this.updateTagOptions();
    }
  }

  updateTagOptions() {
    if (this.editorValue === '') {
      // Skip filter
    } else {
      this.tagOptions = this.tagOptions.filter((x) => x[this.editorValue as keyof TagEntity]);
    }

    const value = this.formGroup.controls[this.formControlName].value;
    if (Array.isArray(value)) {
      (value as TagEntity[]).forEach((t) => {
        if (this.tagOptions.includes(t)) {
          // Continue
        } else {
          this.tagOptions.push(t);
        }
      });
    } else {
      // Skip
    }
    this.tagOptions.sort((a, b) => a.Text.localeCompare(b.Text));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
