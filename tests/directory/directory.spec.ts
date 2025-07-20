import { test, expect } from '@playwright/test';
import { login, navigateToDirectory, takeScreenshot } from '../helpers/utils';
import { TEST_DATA } from '../helpers/test-data';
import { SELECTORS } from '../helpers/selectors';

test.describe('Directory Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToDirectory(page);
  });

  test('Directory page navigation and basic validation', async ({ page }) => {
    test.info().annotations.push({
      type: 'ISTQB',
      description: 'TC-012: Directory page basic validation'
    });

    await test.step('Verify Directory page elements', async () => {
      // Verify header and search
      await expect(page.locator('.oxd-topbar-header-breadcrumb-module')
        .getByText('Directory'))
        .toBeVisible({ timeout: 15000 });
      await expect(page.locator(SELECTORS.DIRECTORY.SEARCH_INPUT))
        .toBeVisible({ timeout: 10000 });
      
      // Verify table exists
      const table = page.locator(SELECTORS.DIRECTORY.TABLE);
      await expect(table).toBeVisible({ timeout: 20000 });
      
      // Check for either rows or "no data" message
      const noData = page.locator(SELECTORS.DIRECTORY.NO_DATA);
      const firstRow = table.locator(SELECTORS.DIRECTORY.TABLE_ROW).first();
      
      if (await noData.isVisible({ timeout: 5000 })) {
        console.log('Directory table is empty - showing "No Records Found"');
        await expect(noData).toBeVisible();
      } else {
        console.log('Directory table has data - verifying first row');
        await expect(firstRow).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test('Directory search functionality validation', async ({ page }) => {
    test.info().annotations.push({
      type: 'ISTQB', 
      description: 'TC-013: Directory search functionality'
    });

    await test.step('Verify search by employee name', async () => {
      await page.locator(SELECTORS.DIRECTORY.SEARCH_INPUT).fill(TEST_DATA.directory.searchName);
      await page.locator('button:has-text("Search")').click();
      await expect(page.locator(SELECTORS.DIRECTORY.TABLE)).toBeVisible();
    });
  });

  test('@boundary Directory pagination validation', async ({ page }) => {
    test.info().annotations.push({
      type: 'ISTQB',
      description: 'TC-014: Directory pagination boundary testing'
    });

    const pagination = page.locator('.oxd-pagination');
    if (await pagination.isVisible()) {
      await test.step('Verify pagination controls', async () => {
        await expect(pagination).toBeVisible();
      });

      await test.step('Verify first page boundary', async () => {
        const firstPage = pagination.locator('.oxd-pagination-page-item:has-text("1")').first();
        await firstPage.click();
        await expect(pagination.locator('.oxd-pagination-page-item.active')).toContainText('1');
      });
    }
  });
});
