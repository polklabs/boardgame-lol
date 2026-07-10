import { definePreset, palette } from '@primeng/themes';
import Lara from '@primeng/themes/lara';

export const LaraDark = definePreset(Lara, {
  semantic: {
    primary: palette('{blue}'),
  },
});
