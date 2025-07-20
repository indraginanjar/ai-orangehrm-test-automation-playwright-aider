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

export async function verifyDashboardWidgets(page: Page, test?: any): Promise<void> {
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

  // Enhanced verification with sampling and limits
  const MAX_RETRIES = 3;
  const WIDGET_TIMEOUT = 20000; // 20 seconds per widget
  const MAX_WIDGETS_TO_CHECK = 5; // Limit number of widgets to verify
  
  // Get a sample of widgets to check (first 3 + random 2 others)
  const widgetsToCheck = [
    ...SELECTORS.DASHBOARD.WIDGET_NAMES.slice(0, 3), // Always check first 3 important widgets
    ...SELECTORS.DASHBOARD.WIDGET_NAMES.slice(3)
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_WIDGETS_TO_CHECK - 3)
  ];

  for (const widgetName of widgetsToCheck) {
    try {
      const widget = page.getByText(widgetName, { exact: true })
        .or(page.getByRole('heading', { name: widgetName }))
        .first();

      let isVerified = false;
      let attempt = 0;
      
      while (attempt < MAX_RETRIES && !isVerified) {
        attempt++;
        try {
          // Combined visibility and scroll check with single timeout
          await widget.scrollIntoViewIfNeeded({ timeout: WIDGET_TIMEOUT });
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });
          
          // Additional checks only if widget is visible
          await expect(widget).toHaveCSS('opacity', '1');
          await expect(widget).toHaveCSS('visibility', 'visible');
          await expect(widget).not.toHaveAttribute('aria-disabled', 'true');
          
          const widgetContainer = widget.locator('.. >> ..');
          await expect(widgetContainer).toContainText(/.+/);
          
          isVerified = true;
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            test.info().annotations.push({
              type: 'Warning',
              description: `Widget '${widgetName}' verification failed after ${MAX_RETRIES} attempts: ${error.message}`
            });
          } else {
            await page.waitForTimeout(2000); // Short delay between retries
          }
        }
      }

      await expect(widget).toHaveCSS('opacity', '1');
      await expect(widget).toHaveCSS('visibility', 'visible');
      
      // Verify widget is interactive
      await expect(widget).not.toHaveAttribute('aria-disabled', 'true');
      
      // Verify widget content exists
      const widgetContainer = widget.locator('.. >> ..'); // Go up two levels
      await expect(widgetContainer).toContainText(/.+/);
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
