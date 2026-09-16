import type { ThemeConfig } from 'antd';

/** Teal accent palette used across antd components and the Recharts visuals. */
export const teal = {
  50: '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0d9488',
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: teal[600],
    colorInfo: teal[600],
    colorLink: teal[700],
    borderRadius: 8,
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: teal[900],
      headerBg: '#ffffff',
      bodyBg: teal[50],
    },
    Menu: {
      darkItemBg: teal[900],
      darkSubMenuItemBg: teal[900],
      darkItemSelectedBg: teal[600],
      darkItemHoverBg: teal[800],
    },
    Statistic: {
      contentFontSize: 26,
    },
  },
};
