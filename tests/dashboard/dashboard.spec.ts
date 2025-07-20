import { test, expect } from '@playwright/test';
import { login, takeScreenshot, verifyDashboardWidgets } from '../helpers/utils';
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

    // Verify widgets using helper function
    await test.step('Verify dashboard widgets', async () => {
      await verifyDashboardWidgets(page);
    });

    // Post-test screenshot
    await takeScreenshot(page, 'dashboard-validation');
  });
});
