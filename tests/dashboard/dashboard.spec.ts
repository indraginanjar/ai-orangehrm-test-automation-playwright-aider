import { test, expect } from '@playwright/test';
import { login, takeScreenshot } from '../helpers/utils';
import { SELECTORS } from '../helpers/selectors';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Dashboard page validation', async ({ page }) => {
    test.info().annotations.push({
      type: 'ISTQB',
      description: 'TC-011: Dashboard page validation'
    });

    // Verify header section
    await test.step('Verify dashboard header', async () => {
      const dashboardHeader = page.locator(SELECTORS.DASHBOARD.HEADER);
      await expect(dashboardHeader).toContainText('Dashboard');
    });

    // Verify widgets
    await test.step('Verify dashboard widgets', async () => {
      const widgetContainer = page.locator(SELECTORS.DASHBOARD.WIDGETS);
      await expect(widgetContainer).toBeVisible();
      
      const expectedWidgets = [
        'Time at Work',
        'My Actions',
        'Quick Launch',
        'Employees on Leave Today'
      ];

      for (const widget of expectedWidgets) {
        await expect(page.getByText(widget, { exact: true }).first()).toBeVisible();
      }
    });

    // Post-test screenshot
    await takeScreenshot(page, 'dashboard-validation');
  });
});
