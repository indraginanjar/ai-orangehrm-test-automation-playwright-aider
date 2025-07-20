export const SELECTORS = {
  LOGIN: {
    USERNAME: 'input[name="username"]',
    PASSWORD: 'input[name="password"]',
    SUBMIT: 'button[type="submit"]'
  },
  DASHBOARD: {
    HEADER: '.oxd-topbar-header-breadcrumb-module',
    WIDGETS: '.orangehrm-dashboard-grid',
    WIDGET_NAMES: [
      'Time at Work',
      'My Actions', 
      'Quick Launch',
      'Employees on Leave Today'
    ]
  },
  DIRECTORY: {
    TABLE: '.orangehrm-container',
    SEARCH_INPUT: ':nth-match(.oxd-input, 1)',
    SEARCH_BUTTON: 'button:has-text("Search")',
    RESET_BUTTON: 'button:has-text("Reset")'
  },
  USER: {
    DROPDOWN: '.oxd-userdropdown-tab',
    LOGOUT: 'a:has-text("Logout")'
  },
  ADMIN: {
    MENU: 'span:has-text("Admin")',
    HEADER: 'h5:has-text("System Users")'
  }
} as const; // Added 'as const' for type safety
