import { FormBuilder } from '@angular/forms';
import { BaseEntity } from 'libs/index';
import { nullableValidator } from './validators/nullable.validator';
import { minMaxValidator } from './validators/min-max.validator';

export function buildForm<T extends BaseEntity>(
  fb: FormBuilder,
  entityType: { new (partial: Partial<T>): T },
  entity: T,
) {
  const formControlsConfig: { [key: string]: unknown } = {};

  // Get property names of the entity class
  const propertyNames = Object.keys(entity) as unknown as (keyof T)[];

  // Build form controls dynamically based on property names
  propertyNames.forEach((propertyName) => {
    formControlsConfig[String(propertyName)] = [
      entity[propertyName],
      [nullableValidator(entityType, propertyName), minMaxValidator(entityType, propertyName)],
    ];
  });

  // Create the form group
  return fb.group(formControlsConfig);
}
