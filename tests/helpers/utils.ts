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

export async function login(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator(SELECTORS.LOGIN.USERNAME).fill(TEST_DATA.credentials.valid.username);
  await page.locator(SELECTORS.LOGIN.PASSWORD).fill(TEST_DATA.credentials.valid.password);
  await page.locator(SELECTORS.LOGIN.SUBMIT).click();
  await page.waitForURL(/dashboard/);
}

export async function verifyDashboardWidgets(page: Page): Promise<void> {
  // Wait for at least one widget to be visible
  await page.waitForFunction(() => {
    const widgets = Array.from(document.querySelectorAll(
      '.orangehrm-dashboard-widget, .oxd-widget, [class*="widget"]'
    ));
    return widgets.some(w => getComputedStyle(w).visibility !== 'hidden');
  }, { timeout: 15000 });

  // Verify each expected widget exists
  for (const widgetName of SELECTORS.DASHBOARD.WIDGET_NAMES) {
    const widget = page.getByText(widgetName, { exact: true })
      .or(page.getByRole('heading', { name: widgetName }))
      .first();
    
    await widget.scrollIntoViewIfNeeded();
    await expect(widget).toBeVisible({ timeout: 10000 });
  }
}

export async function navigateToDirectory(page: Page): Promise<void> {
  await test.step('Navigate to Directory page', async () => {
    // Click with retry in case menu is slow to load
    await page.locator('span:has-text("Directory")').click({ timeout: 15000 });
    await page.waitForURL(/directory/, { timeout: 30000 });
    
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
  });
}
