/* TripTrail — shared Tailwind (Play CDN) config.
   Load AFTER the Tailwind CDN <script> on every page. Mirrors design/stitch DESIGN.md
   so generated Stitch markup (bg-primary, text-on-surface, …) works unchanged. */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // --- Stitch design-system tokens (keep names so mockup markup pastes cleanly) ---
        background: '#f7f9fb',
        surface: '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'on-surface': '#191c1e',
        'on-surface-variant': '#434655',
        outline: '#737686',
        'outline-variant': '#c3c6d7',
        primary: '#2563eb',          // brand blue (Stitch primary-container; our action color)
        'primary-dark': '#1d4ed8',
        'primary-container': '#2563eb',
        'on-primary': '#ffffff',
        'primary-tint': '#eff6ff',
        secondary: '#515f74',
        'secondary-container': '#d5e3fc',
        // --- semantic status colors (paired with text/icon, never color-only) ---
        success: '#16a34a',
        'success-tint': '#dcfce7',
        warning: '#d97706',
        'warning-tint': '#ffedd5',
        danger: '#dc2626',
        'danger-tint': '#fee2e2',
        info: '#4f46e5',
        'info-tint': '#e0e7ff',
        teal: '#0d9488',
        'teal-tint': '#ccfbf1',
        // slate scale for neutral badges/text
        slate: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      borderRadius: { DEFAULT: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
      boxShadow: {
        card: '0px 1px 3px rgba(15, 23, 42, 0.05)',
        lift: '0px 10px 15px -3px rgba(15, 23, 42, 0.1)',
      },
      maxWidth: { container: '1280px' },
    },
  },
};
