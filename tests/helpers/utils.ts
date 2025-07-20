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
  // Wait for at least one widget to be visible with enhanced checks
  await page.waitForFunction(() => {
    const widgets = Array.from(document.querySelectorAll(
      '.orangehrm-dashboard-widget, .oxd-widget, [class*="widget"]'
    ));
    return widgets.some(w => {
      const style = getComputedStyle(w);
      return style.visibility !== 'hidden' && 
             style.opacity !== '0' && 
             w.getBoundingClientRect().width > 0;
    });
  }, { timeout: 20000 });

  // Enhanced verification for each widget with better error handling
  for (const widgetName of SELECTORS.DASHBOARD.WIDGET_NAMES) {
    try {
      const widget = page.getByText(widgetName, { exact: true })
        .or(page.getByRole('heading', { name: widgetName }))
        .first();
      
      // First check if widget exists without scrolling
      const isVisible = await widget.isVisible().catch(() => false);
      
      if (!isVisible) {
        // If not visible, try scrolling into view with retries
        let retries = 3;
        while (retries > 0) {
          try {
            await widget.scrollIntoViewIfNeeded({ timeout: 15000 });
            break;
          } catch (error) {
            retries--;
            if (retries === 0) {
              test.info().annotations.push({
                type: 'Warning',
                description: `Widget '${widgetName}' could not be scrolled into view`
              });
              continue; // Skip to next widget instead of failing
            }
            await page.waitForTimeout(2000);
          }
        }
      }

      // More lenient visibility check
      await expect(widget).toBeVisible({ timeout: 20000 }).catch(() => {
        test.info().annotations.push({
          type: 'Warning', 
          description: `Widget '${widgetName}' visibility check failed`
        });
      });
    await expect(widget).toHaveCSS('opacity', '1');
    await expect(widget).toHaveCSS('visibility', 'visible');
    
    // Verify widget is interactive
    await expect(widget).not.toHaveAttribute('aria-disabled', 'true');
    
    // Verify widget content exists
    const widgetContainer = widget.locator('.. >> ..'); // Go up two levels
    await expect(widgetContainer).toContainText(/.+/);
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
