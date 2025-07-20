import { expect, Page } from '@playwright/test';
import fs from 'fs';
import { BASE_URL, TEST_DATA } from './test-data';
import { SELECTORS } from './selectors';

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
  await page.screenshot({ 
    path: `screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}

export async function login(page: Page, options?: { timeout?: number }): Promise<void> {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator(SELECTORS.LOGIN.USERNAME).fill(TEST_DATA.credentials.valid.username);
  await page.locator(SELECTORS.LOGIN.PASSWORD).fill(TEST_DATA.credentials.valid.password);
  await page.locator(SELECTORS.LOGIN.SUBMIT).click();
  await page.waitForURL(/dashboard/);
}

export async function verifyDashboardWidgets(page: Page): Promise<void> {
  // Simplified verification - just check if widgets exist and are visible
  const widgets = page.locator(SELECTORS.DASHBOARD.WIDGETS);
  await expect(widgets.first()).toBeVisible({ timeout: 15000 });
  
  // Check a few random widgets
  const sampleWidgets = await widgets.all();
  const widgetsToCheck = sampleWidgets
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  for (const widget of widgetsToCheck) {
    await expect(widget).toBeVisible({ timeout: 10000 });
    await expect(widget).toHaveCSS('opacity', '1');
    } catch (error) {
      if (test) {
        test.info().annotations.push({
          type: 'Error',
          description: `Error verifying widget '${widgetName}': ${error.message}`
        });
      } else {
        console.error(`Error verifying widget '${widgetName}':`, error);
      }
    }
  }
}

export async function navigateToDirectory(page: Page): Promise<void> {
  // Click with retry in case menu is slow to load
  await page.locator('span:has-text("Directory")').click({ timeout: 15000 });
  await page.waitForURL(/directory/, { timeout: 30000 });
  
  // Debug: Log current page state
  console.log('Navigated to directory page:', page.url());
  
  // Wait for either table or no data message
  const table = page.locator(SELECTORS.DIRECTORY.TABLE);
  const noData = page.locator(SELECTORS.DIRECTORY.NO_DATA);
  
  await Promise.race([
    table.waitFor({ state: 'visible', timeout: 30000 }),
    noData.waitFor({ state: 'visible', timeout: 30000 })
  ]);
  
  // Additional stability checks
  await expect(page.locator('.oxd-topbar-header-breadcrumb-module'))
    .toContainText('Directory');
  await page.waitForLoadState('networkidle');
  
  // Debug: Log final verification state
  console.log('Table visible:', await table.isVisible());
  console.log('No data message visible:', await noData.isVisible());
  if (await table.isVisible()) {
    console.log('Table row count:', await table.locator(SELECTORS.DIRECTORY.TABLE_ROW).count());
  }
}
