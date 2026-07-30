import { Directive, DoCheck, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHide]',
})
export class HideDirective<T> implements DoCheck {
  @Input('appHide') hideFields: Set<keyof T> = new Set();
  @Input() formControlName: keyof T | '' = '';
  @Input() hideName?: keyof T;

  el = inject(ElementRef);
  renderer = inject(Renderer2);

  ngDoCheck(): void {
    const check = this.hideName ?? this.formControlName;
    if (check !== '') {
      this.setStyle(this.hideFields.has(check));
    } else {
      // Skip
    }
  }

  private setStyle(hide: boolean) {
    this.renderer.setStyle(this.el.nativeElement, 'display', hide ? 'none' : 'block');
  }
}
