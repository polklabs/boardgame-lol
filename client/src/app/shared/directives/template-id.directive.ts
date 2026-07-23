import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ng-template[templateId]',
})
export class TemplateIdDirective {
  template = inject(TemplateRef<unknown>);

  @Input('templateId') id!: string;
}
