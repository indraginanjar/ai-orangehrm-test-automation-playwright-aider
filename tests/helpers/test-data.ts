export const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php';

export const TEST_DATA = {
  credentials: {
    valid: { username: 'Admin', password: 'admin123' },
    invalid: { username: 'wrong', password: 'wrong' },
    empty: { username: '', password: '' },
    caseSensitive: { username: 'ADMIN', password: 'ADMIN123' },
    longInput: {
      username: 'a'.repeat(100),
      password: 'b'.repeat(100)
    }
  },
  directory: {
    searchName: 'Odis',
    jobTitle: 'Chief Executive Officer',
    location: 'Texas R&D'
  }
};

// Alias for backward compatibility
export const CREDENTIALS = TEST_DATA.credentials.valid;
export const INVALID_CREDENTIALS = TEST_DATA.credentials.invalid;
