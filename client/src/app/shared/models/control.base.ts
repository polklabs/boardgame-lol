import { Directive, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Directive()
export abstract class ControlBase<T, K> {
  @Input() formControlName!: keyof T & string;
  @Input() label?: string;
  @Input() entityType!: new (partial: Partial<T>) => T;
  @Input() hiddenFields = new Set<string>();
  @Input() options$?: Observable<K[]>;
  @Input() options?: K[] = [];
  @Input() optionLabel?: keyof K & string;
  @Input() optionValue?: keyof K & string;
  @Input() placeholder?: string;
}
