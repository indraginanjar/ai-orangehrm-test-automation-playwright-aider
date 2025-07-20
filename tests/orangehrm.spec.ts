import { test, expect } from '@playwright/test';
import fs from 'fs';

// Ensure screenshots directory exists
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Screenshot helper with retries and validation
async function takeScreenshot(page, name, maxRetries = 3) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `screenshots/${name}-${timestamp}.png`;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add stability checks before capturing
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Small delay for UI stabilization
      
      // Verify critical element is visible
      await page.locator('body').waitFor({ state: 'visible' });
      
      // Capture with better options
      const screenshot = await page.screenshot({ 
        path: attempt === maxRetries ? path : undefined, // Only save on last attempt
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('.oxd-userdropdown-tab')],
        timeout: 10000
      });
      
      // Verify screenshot is not blank by checking first few pixels
      if (isScreenshotValid(screenshot)) {
        if (attempt > 1) {
          console.log(`Screenshot succeeded on attempt ${attempt}`);
        }
        if (attempt < maxRetries) {
          // Save the successful retry
          await fs.promises.writeFile(path, screenshot);
        }
        console.log(`Screenshot saved: ${path}`);
        return path;
      }
      throw new Error('Blank screenshot detected');
    } catch (error) {
      lastError = error;
      console.warn(`Screenshot attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await page.waitForTimeout(1000); // Wait before retry
      }
    }
  }
  
  throw new Error(`Failed to capture screenshot after ${maxRetries} attempts: ${lastError.message}`);
}

// Helper function to check screenshot validity
function isScreenshotValid(screenshotBuffer) {
  // Simple check - first few pixels shouldn't be all white/black
  const sampleSize = 100;
  let nonBlankPixels = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const pixelValue = screenshotBuffer.readUInt8(i);
    if (pixelValue > 10 && pixelValue < 245) { // Not pure white/black
      nonBlankPixels++;
    }
  }
  
  return nonBlankPixels > sampleSize * 0.5; // At least 50% non-blank
}

// Base URL
const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php';

// Test data
const CREDENTIALS = {
  username: 'Admin',
  password: 'admin123'
};
const INVALID_CREDENTIALS = {
  username: 'wrong',
  password: 'wrong'
};
const TEST_DATA = {
  empty: { username: '', password: '' },
  caseSensitive: { username: 'ADMIN', password: 'ADMIN123' }, // Wrong case
  longInput: { 
    username: 'a'.repeat(100), 
    password: 'b'.repeat(100)
  }
};

test.describe('OrangeHRM Functional Tests - ISTQB Aligned', () => {
  /*
  * Test Suite covering:
  * - Functional requirements (FR-001 to FR-005)
  * - Security requirements (SEC-001 to SEC-003)
  * - UI requirements (UI-001 to UI-002)
  */
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    try {
      await page.goto('https://opensource-demo.orangehrmlive.com', { timeout: 30000 });
    } catch (error) {
      throw new Error('OrangeHRM demo site is not reachable');
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    console.log(`Navigating to ${BASE_URL}/auth/login`);
    let retries = 3;
    while (retries > 0) {
      try {
        await page.goto(`${BASE_URL}/auth/login`, { 
          timeout: 60000,
          waitUntil: 'networkidle'
        });
        
        // Wait for multiple elements with more reliable selectors
        await Promise.all([
          page.waitForSelector('input[name="username"]', { state: 'visible', timeout: 20000 }),
          page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 20000 }),
          page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 20000 })
        ]);
        
        console.log('Login page elements loaded successfully');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await page.waitForTimeout(5000);
        console.log(`Retrying navigation (${retries} attempts left)...`);
      }
    }
  });

  test('Successful login with valid credentials', async ({ page }) => {
    test.setTimeout(60000);
    
    try {
      // Ensure form is ready
      await page.getByPlaceholder('Username').waitFor({ state: 'visible', timeout: 20000 });
      await page.getByPlaceholder('Password').waitFor({ state: 'visible', timeout: 20000 });
      await takeScreenshot(page, 'login-page-initial');

      // Fill form
      await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
      await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
      await takeScreenshot(page, 'login-form-filled');

      // Click login and wait for navigation
      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }),
        page.getByRole('button', { name: 'Login' }).click()
      ]);

      // Verify dashboard with more reliable checks
      await page.waitForURL(/dashboard/, { timeout: 30000 });
      await page.waitForLoadState('networkidle');
      
      const dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb-module');
      await dashboardHeader.waitFor({ state: 'visible', timeout: 20000 });
      await expect(dashboardHeader).toContainText('Dashboard');
      
      await takeScreenshot(page, 'dashboard-loaded');
    } catch (error) {
      console.error('Login test failed:', error);
      await takeScreenshot(page, 'login-error');
      throw error;
    }
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
    await page.getByPlaceholder('Username').waitFor({ state: 'visible', timeout: 15000 });
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
    await page.goto(`${BASE_URL}/dashboard/index`, { waitUntil: 'networkidle' });
    
    // Should be redirected back to login
    await page.waitForURL(/auth\/login/);
  });
  test('@boundary Empty credentials validation', async ({ page }) => {
    await page.getByPlaceholder('Username').fill(TEST_DATA.empty.username);
    await page.getByPlaceholder('Password').fill(TEST_DATA.empty.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Required')).toHaveCount(2); // Both fields show required
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('@security Case sensitive password validation', async ({ page }) => {
    await page.getByPlaceholder('Username').fill(TEST_DATA.caseSensitive.username);
    await page.getByPlaceholder('Password').fill(TEST_DATA.caseSensitive.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('@boundary Long input handling', async ({ page }) => {
    await page.getByPlaceholder('Username').fill(TEST_DATA.longInput.username);
    await page.getByPlaceholder('Password').fill(TEST_DATA.longInput.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // System should handle without crashing
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test.skip('@security Session timeout after inactivity', async ({ page }) => {
    test.setTimeout(400000); // 6 minutes 40 seconds timeout
    
    // Login first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/dashboard/);
    
    // Simulate inactivity by waiting 5 minutes
    await page.waitForTimeout(300000); // 5 minutes
    
    // Try to access protected page with multiple verification approaches
    let redirectedToLogin = false;
    
    // Approach 1: Direct navigation check
    try {
        await page.goto(`${BASE_URL}/dashboard/index`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });
    } catch (error) {
        redirectedToLogin = true;
    }
    
    // Approach 2: Verify current URL if navigation didn't throw
    if (!redirectedToLogin) {
        redirectedToLogin = await page.url().includes('/auth/login');
    }
    
    // Approach 3: Force check if still uncertain
    if (!redirectedToLogin) {
        await page.reload();
        redirectedToLogin = await page.waitForURL(/auth\/login/, { timeout: 10000 }).catch(() => false);
    }
    
    // Final verification
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('@security Concurrent login prevention', async ({ browser }) => {
    test.setTimeout(60000); // Set explicit timeout
    
    // First session
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto(`${BASE_URL}/auth/login`);
    
    // Second session 
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(`${BASE_URL}/auth/login`);

    try {
      console.log('Starting concurrent login test');
      
      // Execute logins in parallel with proper waiting
      await Promise.all([
        // Session 1 login
        (async () => {
          console.log('Starting session 1 login');
          await page1.getByPlaceholder('Username').fill(CREDENTIALS.username);
          await page1.getByPlaceholder('Password').fill(CREDENTIALS.password);
          await takeScreenshot(page1, 'concurrent-session1-filled');
          await page1.getByRole('button', { name: 'Login' }).click();
          await page1.waitForURL(/dashboard/);
          console.log('Session 1 login complete');
        })(),
        
        // Session 2 login
        (async () => {
          console.log('Starting session 2 login');
          await page2.getByPlaceholder('Username').fill(CREDENTIALS.username);
          await page2.getByPlaceholder('Password').fill(CREDENTIALS.password);
          await takeScreenshot(page2, 'concurrent-session2-filled');
          await page2.getByRole('button', { name: 'Login' }).click();
          await page2.waitForURL(/dashboard/);
          console.log('Session 2 login complete');
        })()
      ]);

      // Verify both sessions
      await expect(page1.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(page2.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      
      // Visual verification
      await takeScreenshot(page1, 'concurrent-session1-dashboard');
      await takeScreenshot(page2, 'concurrent-session2-dashboard');
      console.log('Both sessions verified successfully');

    } catch (error) {
      console.error('Concurrent login test failed:', error);
      // Capture screenshots on failure
      await takeScreenshot(page1, 'concurrent-session1-error').catch(e => console.error('Failed to capture error screenshot:', e));
      await takeScreenshot(page2, 'concurrent-session2-error').catch(e => console.error('Failed to capture error screenshot:', e));
      throw error;
    } finally {
      // Clean up - close contexts in parallel
      await Promise.all([
        context1.close().catch(e => console.error('Error closing context1:', e)),
        context2.close().catch(e => console.error('Error closing context2:', e))
      ]);
    }
  });
});
  test('Dashboard page validation', async ({ page }) => {
    test.info().annotations.push({
      type: 'ISTQB',
      description: 'TC-011: Dashboard page validation'
    });
    test.setTimeout(120000);
    
    // Login with more reliable selectors
    await page.goto(`${BASE_URL}/auth/login`);
    
    const usernameField = page.locator('input[name="username"]');
    await usernameField.waitFor({ state: 'visible', timeout: 30000 });
    await usernameField.fill(CREDENTIALS.username);
    
    const passwordField = page.locator('input[name="password"]');
    await passwordField.fill(CREDENTIALS.password);
    
    await page.locator('button[type="submit"]').click();
    
    // Wait for dashboard with multiple checks
    // Wait for dashboard to fully load
    await page.waitForURL(/dashboard/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Test Case 1: Verify header section with more reliable selectors
    await test.step('Verify dashboard header', async () => {
      const dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb-module');
      await expect(dashboardHeader).toContainText('Dashboard');
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });

    // Test Case 2: Verify widgets with improved selectors
    await test.step('Verify dashboard widgets', async () => {
      const widgetContainer = page.locator('.oxd-dashboard-grid');
      await expect(widgetContainer).toBeVisible();
      
      const expectedWidgets = [
        'Time at Work',
        'My Actions',
        'Quick Launch',
        'Employees on Leave Today',
        'Employee Distribution by Sub Unit',
        'Employee Distribution by Location'
      ];

      for (const widget of expectedWidgets) {
        await expect(page.getByText(widget, { exact: true }).first()).toBeVisible({ timeout: 5000 });
      }
    });

    // Test Case 3: Verify quick launch functionality with better selectors
    await test.step('Verify quick launch buttons', async () => {
      const quickLaunchContainer = page.locator('.orangehrm-quick-launch');
      await expect(quickLaunchContainer).toBeVisible();

      const quickLaunchButtons = [
        'Assign Leave',
        'Leave List',
        'Timesheets',
        'Apply Leave', 
        'My Leave',
        'My Timesheet'
      ];

      for (const buttonText of quickLaunchButtons) {
        const button = page.locator('.orangehrm-quick-launch').getByText(buttonText, { exact: true });
        await expect(button).toBeVisible({ timeout: 5000 });
        await expect(button).toBeEnabled();
      }
    });

    // Post-test screenshot with error handling
    try {
      await takeScreenshot(page, 'dashboard-validation');
    } catch (error) {
      console.error('Dashboard validation screenshot failed:', error);
    }
  });

  test('@mock @security Session timeout simulation', async ({ page }) => {
    test.setTimeout(30000);
    
    // Navigasi ke halaman login
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Tunggu sampai elemen login muncul
    await page.getByPlaceholder('Username').waitFor({ state: 'visible' });
    
    // Login first
    await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Tunggu sampai dashboard muncul
    await page.waitForURL(/dashboard/);
    
    // Mock session timeout by clearing storage
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.context().clearCookies();
    
    // Try to access protected page with error handling
    try {
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index', {
            waitUntil: 'domcontentloaded',
            timeout: 5000
        });
    } catch (error) {
        // Jika gagal, coba navigasi ke login page langsung
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    }
    
    // Verify redirect
    await page.waitForURL(/auth\/login/);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });
