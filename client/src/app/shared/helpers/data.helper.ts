import { TagCategory, TagCategoryMapping, TagEntity } from 'libs/index';
import { Column } from '../models/column.model';

export function isEmptyLike(value: unknown): boolean {
  if (value == null) {
    return true; // null or undefined
  } else if (typeof value === 'number' && value === 0) {
    return true;
  } else if (typeof value === 'string' && value.trim() === '') {
    return true;
  } else if (Array.isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

export function getTagColumns<
  T extends { Tags: TagEntity[] },
  K extends keyof (typeof TagCategoryMapping)[TagCategory] = keyof (typeof TagCategoryMapping)[TagCategory],
>(check: K) {
  return Object.entries(TagCategoryMapping)
    .filter((x) => x[1][check])
    .map(
      (tc) =>
        ({
          id: 'Tags',
          name: tc[1].text,
          dataType: 'tag',
          fieldFunc: (x) => tagFilter(x.Tags, tc[0] as TagCategory),
        }) as Column<T>,
    );
}

export function tagFilter(tags: TagEntity[], category: TagCategory): TagEntity[] {
  return tags.filter((t) => t.Category === category);
}
