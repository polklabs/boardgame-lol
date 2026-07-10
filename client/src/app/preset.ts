import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';

export const LaraDark = definePreset(Lara, {
  semantic: {
    primary: {
      50: '#f7fbff',
      100: '#d9e9fe',
      200: '#bbd8fd',
      300: '#9cc7fc',
      400: '#7eb6fb',
      500: '#60a5fa',
      600: '#528cd5',
      700: '#4374af',
      800: '#355b8a',
      900: '#264264',
    },

    colorScheme: {
      dark: {
        primary: {
          color: '#60a5fa',
        },
        surface: {
          950: '#111827',
          900: '#1f2937',
          800: '#1f2937',
          700: '#424b57',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
          200: '#e5e7eb',
          100: '#f3f4f6',
          50: '#f9fafb',
          0: '#ffffff',
        },
      },
    },
  },
  components: {
    tabs: {
      tabpanel: {
        background: 'none',
        padding: 0,
      },
    },
    listbox: {
      option: {
        padding: '8px',
      },
    },
    dialog: {
      header: {
        padding: '1rem 1rem 4px'
      },
      content: {
        padding: '0 1rem 1rem',
      },
    },
    datatable: {
      colorScheme: {
        dark: {
          row: {
            striped: {
              background: '#1c2532',
            },
          },
        },
      },
      header: {
        cell: {
          padding: '0.5rem',
        },
        padding: '0.5rem',
      },
      body: {
        cell: {
          padding: '0.5rem',
        },
      },
    },
  },
});
