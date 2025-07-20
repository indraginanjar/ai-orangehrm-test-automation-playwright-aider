import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for (15 minutes) */
  timeout: 900000,
  /* Filter tests by tags */
  grep: process.env.TEST_TYPE ? 
    new RegExp(process.env.TEST_TYPE, 'i') : // Case insensitive matching
    /^(?!.*@mock)/,
  grepInvert: undefined,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'playwright-report',
      attachScreenshots: true,
      attachTrace: true 
    }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Timeout settings */
    actionTimeout: 30000, // Each action timeout
    navigationTimeout: 30000, // Navigation timeout

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    /* Capture screenshots and videos */
    screenshot: {
      mode: 'on', // Changed from 'only-on-failure' to capture screenshots for all tests
      fullPage: true,
      scale: 'css',
      caret: 'hide',
      animations: 'disabled',
      timeout: 10000
    },
    video: {
      mode: 'on',
      size: { 
        width: process.env.VIDEO_WIDTH ? parseInt(process.env.VIDEO_WIDTH) : 640,
        height: process.env.VIDEO_HEIGHT ? parseInt(process.env.VIDEO_HEIGHT) : 360 
      }
    },
    /* Viewport settings */
    viewport: { width: 1280, height: 720 }, // Fixed viewport
    launchOptions: {
      slowMo: 500, // Increased delay between actions for slow environments
    },
    actionTimeout: 60000,
    navigationTimeout: 60000
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
