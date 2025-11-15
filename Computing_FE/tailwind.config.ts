import type { Config } from 'tailwindcss';
import { colors as dsColors } from './src/design-system/colors';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          main: dsColors.primary.main,
          light: dsColors.primary.light,
          medium: dsColors.primary.medium,
          dark: dsColors.primary.dark,
        },
        success: dsColors.semantic.success,
        warning: dsColors.semantic.warning,
        error: dsColors.semantic.error,
        info: dsColors.semantic.info,
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
