import { Component, input, model, OnInit } from '@angular/core';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TextInputComponent } from '../textinput/textinput.component';
import { NgStyle } from '@angular/common';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseEntity, getAccessibleBackground } from 'libs/index';
import { Subscription } from 'rxjs';
import { HideDirective } from '../../../directives/hide.directive';

@Component({
  selector: 'app-color-select',
  imports: [
    ColorPickerModule,
    ButtonModule,
    TextInputComponent,
    NgStyle,
    HideDirective,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './color-select.component.html',
  styleUrl: './color-select.component.scss',
})
export class ColorSelectComponent<T extends BaseEntity & { Color: string | null }> implements OnInit {
  entityType = input.required<new (partial: Partial<T>) => T>();
  formGroup = input.required<FormGroup>();
  hideFields = input<Set<keyof T>>(new Set());

  bgColor = model('');

  presetColors: { severity: ButtonSeverity; color: string | null; text: string }[] = [
    { severity: 'contrast', color: null, text: 'Default (White)' },
    { severity: 'secondary', color: '#ffffff', text: 'Black' },
    { severity: 'success', color: '#156934', text: 'Green' },
    { severity: 'info', color: '#0e5780', text: 'Blue' },
    { severity: 'warn', color: '#C2410C', text: 'Orange' },
    { severity: 'help', color: '#380b61', text: 'Purple' },
    { severity: 'danger', color: '#B91C1C', text: 'Red' },
  ];

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.getControl('Color')?.valueChanges.subscribe(() => {
        this.updateColor();
      }),
    );
    this.updateColor();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getControl(key: keyof T & string): AbstractControl<any, any, any> | null {
    return this.formGroup().get(key);
  }

  setColor(color: string | object | null) {
    const control = this.getControl('Color');
    control?.setValue(color);
    control?.markAsTouched();
    control?.markAsDirty();
    control?.updateValueAndValidity();
    this.updateColor();
  }

  updateColor() {
    const control = this.getControl('Color');
    if (control?.valid) {
      this.bgColor.update(() => getAccessibleBackground(control?.value));
    } else {
      this.bgColor.update(() => '');
    }
  }
}
