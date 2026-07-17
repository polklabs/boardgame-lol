import { FormBuilder } from '@angular/forms';
import { nullableValidator } from './validators/nullable.validator';
import { minMaxValidator } from './validators/min-max.validator';
import { patternValidator } from './validators/pattern.validator';

export function buildForm<T extends object>(fb: FormBuilder, entityType: new (partial: Partial<T>) => T, entity: T) {
  const formControlsConfig: { [key: string]: unknown } = {};

  // Get property names of the entity class
  const propertyNames = Object.keys(entity) as unknown as (keyof T)[];

  // Build form controls dynamically based on property names
  propertyNames.forEach((propertyName) => {
    formControlsConfig[String(propertyName)] = [
      entity[propertyName],
      [
        nullableValidator(entityType, propertyName),
        minMaxValidator(entityType, propertyName),
        patternValidator(entityType, propertyName),
      ],
    ];
  });

  // Create the form group
  return fb.group(formControlsConfig);
}
