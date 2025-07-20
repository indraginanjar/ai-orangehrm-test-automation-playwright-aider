# OrangeHRM Test Automation with Playwright

This project provides automated testing for the OrangeHRM demo application using Playwright, following ISTQB testing standards.

## Features

- Comprehensive test coverage including:
  - Authentication (login/logout)
  - Navigation
  - Boundary testing
  - Security testing
- ISTQB-aligned test cases
- Cross-browser testing support
- HTML test reporting

## Prerequisites

- Node.js (v16 or later)
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd orangehrm_test_aider_playwright
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests in Chromium:
```bash
npx playwright test tests/orangehrm.spec.ts --project chromium
```

### Run specific test categories:
```bash
# Run only security tests
TEST_TYPE=@security npx playwright test

# Run boundary tests
TEST_TYPE=@boundary npx playwright test

# Run mock tests (faster alternative for CI/local development)
TEST_TYPE=@mock npx playwright test
```

### Run in other browsers:
```bash
# Firefox
npx playwright test --project firefox

# WebKit (Safari)
npx playwright test --project webkit
```

### Run with UI mode:
```bash
npx playwright test --ui
```

## Mock Testing

For faster test execution during development, we provide mock versions of certain tests:

1. **Session Timeout Simulation** (`@mock @security`):
   - Simulates session timeout by clearing cookies instead of waiting
   - Runs in seconds instead of minutes
   - Same validation as real test

Usage:
```bash
# Run only mock tests
TEST_TYPE=@mock npx playwright test

# Run all tests except mocks (default)
npx playwright test

# Run both real and mock tests
npx playwright test --grep-invert nothing
```

Mock tests are automatically excluded by default (see playwright.config.ts). They are useful for:
- Local development
- CI pipelines where test speed is critical
- Debugging test logic without long waits

## Viewing Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Structure

The test suite includes:

1. **Functional Tests**
   - Successful login
   - Failed login
   - Navigation
   - Logout

2. **Boundary Tests**
   - Empty credentials
   - Long input handling
   - Case sensitivity

3. **Security Tests**
   - Session timeout
   - Concurrent login

## Configuration

Configuration options can be modified in `playwright.config.ts`:
- Test directory
- Parallel execution
- Retries
- Browsers
- Reporting

## CI/CD Integration

The project is ready for CI/CD integration with:
- GitHub Actions
- Jenkins
- CircleCI

## Maintenance

To update dependencies:
```bash
npm update
```

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## License

[MIT License](LICENSE)
