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
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { TagComponent } from '../../tag/tag.component';
import { ControlBase } from '../../../models/control.base';
import { TagPickerComponent } from '../../tag-picker/tag-picker.component';
import { SortPipe } from "../../../pipes/sort.pipe";

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
    TagPickerComponent,
    SortPipe
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
export class TagsComponent<T> extends ControlBase<T, TagEntity> implements ControlValueAccessor {
  private formGroupDirective = inject(FormGroupDirective);

  @Input() filterBool: keyof TagEntity | '' = '';
  @Input() filterBoardGame?: string;
  
  @Output() changed = new EventEmitter<TagEntity[]>();

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

  onModelChange(value: TagEntity[]): void {
    this.changed.emit(value);
  }

  onPanelShow(dropdown: MultiSelect) {
    dropdown.hide();
    this.editorTagsVisible = true;
  }

  closePicker(dropdown: MultiSelect, options: TagEntity[]) {
    this.editorTagsVisible = false;
    dropdown.updateModel(options);
  }
}
