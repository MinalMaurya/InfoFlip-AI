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

        // Minimal White + Slate + Soft Steel Blue Neutral Scale mapped to slate utilities for 100% theme consistency
        slate: {
          0: '#FFFFFF',   // Main card surface (light)
          50: '#F7F8FA',  // Page background (light)
          100: '#F1F3F6', // Muted surface / sidebar (light)
          150: '#EAF0F8', // Selected surface (light)
          200: '#E1E5EC', // Borders (light)
          250: '#F5F7FA', // Primary text (dark)
          300: '#D1D7E2', // Scrollbar thumb / subtle border (light)
          400: '#A7B0BF', // Secondary text (dark)
          500: '#667085', // Secondary text (light)
          600: '#4B5565', // Neutral grey
          700: '#303540', // Borders (dark)
          750: '#252F40', // Selected surface (dark)
          800: '#20232A', // Elevated surface (dark)
          850: '#273449', // Primary text (light)
          900: '#191B21', // Main card surface (dark)
          925: '#15171D', // Sidebar background (dark)
          950: '#111318', // Page background (dark)
        },

        // Minimal White + Slate + Soft Steel Blue Brand & Accent Scale (#6485B5 / #4F719F / #8EACD8 / #A8BFE3)
        brand: {
          50: '#F7F8FA',  // Page background (light)
          100: '#EAF0F8', // Soft steel blue selected surface (light)
          200: '#D1D7E2',
          300: '#A8BFE3', // Steel blue hover (dark)
          400: '#8EACD8', // Steel blue accent (dark)
          500: '#6485B5', // Steel blue primary (light)
          600: '#6485B5', // Steel blue primary (light)
          700: '#4F719F', // Steel blue hover (light)
          800: '#3D5980',
          900: '#273449', // Primary text (light)
          950: '#111318', // Page background (dark)
        },

        copper: {
          50: '#F7F8FA',
          100: '#EAF0F8',
          200: '#D1D7E2',
          300: '#A8BFE3',
          400: '#8EACD8',
          500: '#6485B5',
          600: '#6485B5',
          700: '#4F719F',
          800: '#3D5980',
          900: '#273449',
          950: '#111318',
        },

        champagne: {
          DEFAULT: '#EAF0F8',
          light: '#F1F3F6',
          dark: '#252F40',
        },

        // Unified Steel Blue mapping for legacy indigo/purple/violet classes
        indigo: {
          50: '#F7F8FA',
          100: '#EAF0F8',
          200: '#E1E5EC',
          300: '#A8BFE3',
          400: '#8EACD8',
          500: '#6485B5',
          600: '#6485B5',
          700: '#4F719F',
          800: '#303540',
          900: '#191B21',
          950: '#111318',
        },
        purple: {
          50: '#F7F8FA',
          100: '#EAF0F8',
          200: '#E1E5EC',
          300: '#A8BFE3',
          400: '#8EACD8',
          500: '#6485B5',
          600: '#6485B5',
          700: '#4F719F',
          800: '#303540',
          900: '#191B21',
          950: '#111318',
        },
        violet: {
          50: '#F7F8FA',
          100: '#EAF0F8',
          200: '#E1E5EC',
          300: '#A8BFE3',
          400: '#8EACD8',
          500: '#6485B5',
          600: '#6485B5',
          700: '#4F719F',
          800: '#303540',
          900: '#191B21',
          950: '#111318',
        },
        ai: {
          blue: '#6485B5',
          purple: '#6485B5',
          cyan: '#8EACD8',
          emerald: '#287A52',
          amber: '#98651A',
          rose: '#B93B35',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.22s ease-out',
        'slide-in-right': 'slideInRight 0.22s ease-out',
        'scale-in': 'scaleIn 0.18s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
