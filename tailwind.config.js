/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Global Semantic Token System (Graphite + Steel Blue)
        'app-bg': 'var(--color-app-background)',
        'sidebar-bg': 'var(--color-sidebar-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          hover: 'var(--color-surface-hover)',
          selected: 'var(--color-surface-selected)',
        },
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        divider: 'var(--color-divider)',
        'focus-ring': 'var(--color-focus-ring)',
        'input-bg': 'var(--color-input-background)',
        'input-border': 'var(--color-input-border)',
        placeholder: 'var(--color-placeholder)',
        'disabled-bg': 'var(--color-disabled-background)',
        'disabled-text': 'var(--color-disabled-text)',
        overlay: 'var(--color-overlay)',

        // Standard semantic aliases
        background: 'var(--color-app-background)',
        foreground: 'var(--color-text-primary)',
        card: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
          subtle: 'var(--color-surface-elevated)',
        },
        border: 'var(--color-border)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--color-primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--accent-foreground)',
          subtle: 'var(--color-surface-selected)',
        },
        'secondary-accent': {
          DEFAULT: 'var(--color-accent)',
          subtle: 'var(--color-surface-hover)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          subtle: 'var(--color-success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          subtle: 'var(--color-warning-subtle)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          subtle: 'var(--color-error-subtle)',
        },

        // Approved Graphite Neutral Scale mapped to slate utilities for 100% theme consistency
        slate: {
          0: '#FFFFFF',   // Light cards, input & elevated surfaces
          50: '#F4F6F8',  // Light main application background
          100: '#E9EDF2', // Light sidebar background
          150: '#E3E8EE', // Light hover surfaces
          200: '#DCE2E8', // Light borders & dividers
          250: '#F3F4F6', // Dark primary text
          300: '#C2CCD6', // Light subtle border / control accent
          400: '#ADB5C2', // Dark secondary text
          500: '#657180', // Light secondary text
          600: '#4B5665', // Light strong secondary text
          700: '#343943', // Dark borders & dividers
          750: '#303642', // Dark hover surfaces
          800: '#2C313B', // Dark elevated surfaces & popovers
          850: '#202833', // Light primary text / deep graphite surface
          900: '#242831', // Dark sidebar, card & input surfaces
          950: '#16181C', // Dark main application background
        },

        // Approved Steel Blue Brand & Accent Scale (#526B88 / #8298B0)
        brand: {
          50: '#F4F6F8',
          100: '#E9EDF2',
          200: '#D8E1EA', // Light selected navigation background
          300: '#B4C3D4',
          400: '#8298B0', // Secondary accent & dark focus ring
          500: '#68809B',
          600: '#526B88', // Primary accent & light focus ring
          700: '#445A73', // Primary hover (light)
          800: '#344252', // Dark selected navigation background
          900: '#242831', // Dark surface
          950: '#16181C', // Dark app background
        },

        // Unified Steel Blue mapping for legacy indigo/purple/violet classes
        indigo: {
          50: '#F4F6F8',
          100: '#E9EDF2',
          200: '#D8E1EA',
          300: '#B4C3D4',
          400: '#8298B0',
          500: '#68809B',
          600: '#526B88',
          700: '#445A73',
          800: '#344252',
          900: '#242831',
          950: '#16181C',
        },
        purple: {
          50: '#F4F6F8',
          100: '#E9EDF2',
          200: '#D8E1EA',
          300: '#B4C3D4',
          400: '#8298B0',
          500: '#68809B',
          600: '#526B88',
          700: '#445A73',
          800: '#344252',
          900: '#242831',
          950: '#16181C',
        },
        violet: {
          50: '#F4F6F8',
          100: '#E9EDF2',
          200: '#D8E1EA',
          300: '#B4C3D4',
          400: '#8298B0',
          500: '#68809B',
          600: '#526B88',
          700: '#445A73',
          800: '#344252',
          900: '#242831',
          950: '#16181C',
        },
        ai: {
          purple: '#526B88',
          cyan: '#8298B0',
          emerald: '#23845B',
          amber: '#B7791F',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
