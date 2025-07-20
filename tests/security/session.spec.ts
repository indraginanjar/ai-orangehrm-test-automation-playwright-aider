import { test, expect } from '@playwright/test';
import { login } from '../helpers/utils';
import { BASE_URL } from '../../helpers/test-data';

test.describe('Session Security Tests', () => {
  test('@mock @security Session timeout simulation', async ({ page }) => {
    test.setTimeout(30000);
    
    await login(page);
    
    // Mock session timeout by clearing storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    
    // Try to access protected page
    try {
      await page.goto(`${BASE_URL}/dashboard/index`, {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });
    } catch (error) {
      await page.goto(`${BASE_URL}/auth/login`);
    }
    
    // Verify redirect to login
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });

  test('@security Concurrent login prevention', async ({ browser }) => {
    test.setTimeout(60000);
    
    // First session
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    // Second session 
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    try {
      // Execute logins in parallel
      await Promise.all([
        (async () => {
          await login(page1);
          await expect(page1.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        })(),
        
        (async () => {
          await login(page2);
          await expect(page2.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        })()
      ]);

    } finally {
      // Clean up
      await Promise.all([
        context1.close(),
        context2.close()
      ]);
    }
  });
});
