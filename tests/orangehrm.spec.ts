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
    await page.waitForURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Time at Work')).toBeVisible();
  });

  test('Failed login with invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.getByPlaceholder('Username').fill(INVALID_CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(INVALID_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify error message - wait for alert to appear and check text
    const errorAlert = page.locator('.oxd-alert-content >> .oxd-text');
    await errorAlert.waitFor();
    await expect(errorAlert).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/auth\/login/); // Still on login page
  });

  test('Navigation to Admin module', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to Admin
    await page.locator('span:has-text("Admin")').first().click();
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);
    await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();
  });

  test('Successful logout', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Logout
    await page.locator('.oxd-userdropdown-tab').waitFor();
    await page.locator('.oxd-userdropdown-tab').click();
    await page.locator('a:has-text("Logout")').waitFor();
    await page.locator('a:has-text("Logout")').click();

    // Verify back to login page
    await page.waitForURL(/auth\/login/);
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('Session validation after logout', async ({ page }) => {
    // Login and logout first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('.oxd-userdropdown-tab').waitFor();
    await page.locator('.oxd-userdropdown-tab').click();
    await page.locator('a:has-text("Logout")').waitFor();
    await page.locator('a:has-text("Logout")').click();

    // Try to access dashboard directly
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index', { waitUntil: 'networkidle' });
    
    // Should be redirected back to login
    await page.waitForURL(/auth\/login/);
  });
});
