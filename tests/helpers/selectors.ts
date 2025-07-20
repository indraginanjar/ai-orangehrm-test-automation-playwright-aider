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
    TABLE: '.orangehrm-container, .oxd-table, [role="table"], .oxd-table-card-container',
    SEARCH_INPUT: ':nth-match(.oxd-input, 1)',
    SEARCH_BUTTON: 'button:has-text("Search")',
    RESET_BUTTON: 'button:has-text("Reset")',
    TABLE_ROW: '.oxd-table-card, .oxd-table-row, [role="row"]:not([role="heading"]), .oxd-table-body > div',
    NO_DATA: '.oxd-table-cell:has-text("No Records Found"), .oxd-table-cell:has-text("No data"), .oxd-table-card:has-text("No Records Found")'
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
