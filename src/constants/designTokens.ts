/**
 * Design Tokens - Sistema de diseño mobile-first
 * Valores base para móvil, se escalan hacia arriba
 */

export const spacing = {
	0: '0',
	1: '0.25rem', // 4px
	2: '0.5rem', // 8px
	3: '0.75rem', // 12px
	4: '1rem', // 16px
	5: '1.25rem', // 20px
	6: '1.5rem', // 24px
	8: '2rem', // 32px
	10: '2.5rem', // 40px
	12: '3rem', // 48px
	16: '4rem', // 64px
	20: '5rem', // 80px
} as const;

export const fontSizes = {
	xs: '0.75rem', // 12px
	sm: '0.875rem', // 14px
	base: '1rem', // 16px
	lg: '1.125rem', // 18px
	xl: '1.25rem', // 20px
	'2xl': '1.5rem', // 24px
	'3xl': '1.875rem', // 30px
} as const;

export const lineHeights = {
	tight: '1.25',
	snug: '1.375',
	normal: '1.5',
	relaxed: '1.625',
	loose: '2',
} as const;

export const colors = {
	primary: {
		50: '#f0f4ff',
		100: '#e0e9ff',
		200: '#c7d7fe',
		300: '#a5b8fc',
		400: '#818cf8',
		500: '#6366f1',
		600: '#4f46e5',
		700: '#4338ca',
		800: '#3730a3',
		900: '#312e81',
	},
	gray: {
		50: '#f9fafb',
		100: '#f3f4f6',
		200: '#e5e7eb',
		300: '#d1d5db',
		400: '#9ca3af',
		500: '#6b7280',
		600: '#4b5563',
		700: '#374151',
		800: '#1f2937',
		900: '#111827',
	},
	success: {
		50: '#f0fdf4',
		100: '#dcfce7',
		500: '#22c55e',
		600: '#16a34a',
	},
	error: {
		50: '#fef2f2',
		100: '#fee2e2',
		500: '#ef4444',
		600: '#dc2626',
	},
} as const;

export const borderRadius = {
	none: '0',
	sm: '0.125rem', // 2px
	base: '0.25rem', // 4px
	md: '0.375rem', // 6px
	lg: '0.5rem', // 8px
	xl: '0.75rem', // 12px
	'2xl': '1rem', // 16px
	full: '9999px',
} as const;

export const shadows = {
	sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
	base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
	md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
	lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export const breakpoints = {
	sm: '640px',
	md: '768px',
	lg: '1024px',
	xl: '1280px',
	'2xl': '1536px',
} as const;

// Áreas táctiles mínimas para móvil (44x44px según Apple HIG)
export const touchTargets = {
	min: '2.75rem', // 44px
	comfortable: '3rem', // 48px
} as const;

