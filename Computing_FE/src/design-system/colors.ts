/**
 * Design System - Color Palette
 * SIPENA - Sistem Pengelolaan Naskah Akademik
 */

export const colors = {
  primary: {
    main: '#B28D35',
    light: '#E8E8E8',
    medium: '#818285',
    dark: '#58585A',
  },
  semantic: {
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
  },
} as const;

export type ColorPalette = typeof colors;
