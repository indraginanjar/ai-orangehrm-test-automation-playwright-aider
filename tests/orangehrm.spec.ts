import { test, expect } from '@playwright/test';

// Test data
const CREDENTIALS = {
  username: 'Admin',
  password: 'admin123'
};
const INVALID_CREDENTIALS = {
  username: 'wrong',
  password: 'wrong'
};

test.describe('OrangeHRM Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  });

  test('Successful login with valid credentials', async ({ page }) => {
    // Fill login form
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify dashboard appears after login
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Time at Work')).toBeVisible();
  });

  test('Failed login with invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.getByPlaceholder('Username').fill(INVALID_CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(INVALID_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/); // Still on login page
  });

  test('Navigation to Admin module', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to Admin
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);
    await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();
  });

  test('Successful logout', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Logout
    await page.getByRole('button', { name: 'User Profile' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // Verify back to login page
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });

  test('Session validation after logout', async ({ page }) => {
    // Login and logout first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'User Profile' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // Try to access dashboard directly
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
    
    // Should be redirected back to login
    await expect(page).toHaveURL(/auth\/login/);
  });
});
