import { test, expect } from '@playwright/test';
import { login, takeScreenshot, verifyDashboardWidgets } from '../helpers/utils';
import { SELECTORS } from '../helpers/selectors';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Dashboard page validation @functional @FR-006', async ({ page }) => {
    test.info().annotations.push(
      { type: 'ISTQB', description: 'TC-011: Dashboard page validation' },
      { type: 'Requirement', description: 'FR-006: Dashboard Display' },
      { type: 'Priority', description: 'High' }
    );

    // Verify header section
    await test.step('Verify dashboard header', async () => {
      const dashboardHeader = page.locator(SELECTORS.DASHBOARD.HEADER);
      await expect(dashboardHeader).toContainText('Dashboard');
    });

    // Verify widgets using helper function
    await test.step('Verify dashboard widgets', async () => {
      await verifyDashboardWidgets(page);
      
      // Enhanced verification
      const widgets = page.locator(SELECTORS.DASHBOARD.WIDGETS);
      const widgetCount = await widgets.count();
      expect(widgetCount).toBeGreaterThan(0); // Verify at least 1 widget exists
      test.info().annotations.push({
        type: 'Info',
        description: `Found ${widgetCount} widgets on dashboard`
      });
      
      // Boundary test - slow network
      await test.step('Verify widget loading under slow network', async () => {
        await page.emulateNetworkConditions({ offline: false, downloadThroughput: 50000 });
        await verifyDashboardWidgets(page);
      });
    });

    // Post-test screenshot
    await takeScreenshot(page, 'dashboard-validation');
  });

  test('Dashboard with missing widgets @negative @FR-006', async ({ page }) => {
    test.info().annotations.push(
      { type: 'ISTQB', description: 'TC-015: Dashboard missing widgets' },
      { type: 'TestType', description: 'Negative' }
    );

    // Get initial widget count
    const initialWidgets = page.locator(SELECTORS.DASHBOARD.WIDGETS);
    const initialCount = await initialWidgets.count();
    
    // Remove first widget and verify count decreased by 1
    await page.evaluate(() => {
      const widgets = document.querySelectorAll('.orangehrm-dashboard-widget');
      if (widgets.length > 0) {
        widgets[0].remove();
        return true;
      }
      return false;
    });

    // Verify widget count decreased by 1
    const widgets = page.locator(SELECTORS.DASHBOARD.WIDGETS);
    await expect(widgets).toHaveCount(initialCount - 1, { timeout: 10000 });
    await expect(page.locator('.oxd-alert')).not.toBeVisible(); // No error shown
    await takeScreenshot(page, 'dashboard-missing-widget');
  });
});
