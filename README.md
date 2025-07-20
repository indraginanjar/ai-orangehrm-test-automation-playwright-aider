# AI-Assisted OrangeHRM Test Automation with Playwright

This project demonstrates the creation of automated tests for OrangeHRM using Playwright, developed with the assistance of:

- **Aider** as the AI pair programming tool
- **DeepSeek** as the LLM model
- Following ISTQB testing standards

## Key Features

### AI-Assisted Development

- Entire test suite co-developed with AI using aider
- DeepSeek model provided intelligent test case suggestions
- Automated code reviews and optimizations

### Comprehensive Test Coverage

- Authentication (login/logout) workflows
- Navigation testing
- Boundary value analysis
- Security validation

### ISTQB-Aligned

- Standardized test case documentation
- Traceability matrix
- Proper test categorization

## Development Approach

1. **AI Pair Programming**:
   - Used aider for real-time code suggestions
   - DeepSeek model helped with:
     - Test case generation
     - Playwright API usage
     - Error troubleshooting

2. **Iterative Development**:
   - Started with basic login tests
   - Expanded to full test suite
   - Continuously refined with AI feedback

3. **Quality Assurance**:
   - AI-assisted code reviews
   - Automated test execution
   - Continuous improvements

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

   ```powershell
   npx playwright install
   ```

## Running Tests

### Run all tests in Chromium

```bash
npx playwright test tests/orangehrm.spec.ts --project chromium
```

```powershell
npx playwright test tests/orangehrm.spec.ts --project chromium
```

### Run specific test categories

```bash
# Run only security tests
TEST_TYPE=@security npx playwright test

# Run boundary tests
TEST_TYPE=@boundary npx playwright test

# Run mock tests (faster alternative for CI/local development)
TEST_TYPE=@mock npx playwright test
```

```powershell
# Run only security tests
$env:TEST_TYPE = "@security"; npx playwright test
# Or alternative syntax:
# $env:TEST_TYPE='@security'
# npx playwright test

# Run boundary tests  
$env:TEST_TYPE = "@boundary"; npx playwright test
# Or:
# $env:TEST_TYPE='@boundary'
# npx playwright test

# Run mock tests
$env:TEST_TYPE = "@mock"; npx playwright test
# Or:
# $env:TEST_TYPE='@mock'
# npx playwright test
```

### Run in other browsers

```bash
# Firefox
npx playwright test --project firefox

# WebKit (Safari)
npx playwright test --project webkit
```

```powershell
# Firefox
npx playwright test --project firefox

# WebKit (Safari)
npx playwright test --project webkit
```

### Run with UI mode

```bash
npx playwright test --ui
```

```powershell
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

# Run only real session timeout test (scheduled nightly)
npx playwright test --grep "@security Session timeout after inactivity" --timeout=400000

# Run all tests except the long timeout test
npx playwright test --grep-invert "@security Session timeout after inactivity"
```
```powershell
# Run only mock tests
$env:TEST_TYPE="@mock"; npx playwright test

# Run all tests except mocks
npx playwright test

# Run both real and mock tests
npx playwright test --grep-invert nothing

# Run only real session timeout test
npx playwright test --grep "@security Session timeout after inactivity" --timeout=400000

# Run all tests except long timeout test
npx playwright test --grep-invert "@security Session timeout after inactivity"
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
```powershell
npx playwright show-report
```

## Test Case Documentation

### Test Cases

| Test Case ID | Test Case Name | Priority | Test Type | Description | Preconditions | Test Steps | Expected Result | Notes |
|-------------|----------------|----------|-----------|-------------|--------------|------------|-----------------|-------|
| TC-001 | Successful login | High | Functional | Verify login with valid credentials | 1. On login page<br>2. Stable connection | 1. Input valid username<br>2. Input valid password<br>3. Click Login | 1. Redirect to dashboard<br>2. Show "Dashboard" header<br>3. Show "Time at Work" widget | FR-001 |
| TC-002 | Failed login | High | Functional | Verify login blocks with invalid credentials | 1. On login page | 1. Input invalid username<br>2. Input invalid password<br>3. Click Login | 1. Show "Invalid credentials"<br>2. Stay on login page | FR-002 |
| TC-003 | Admin navigation | Medium | Functional | Verify Admin module access | 1. User logged in | 1. Click Admin menu | 1. Redirect to System Users<br>2. Show "System Users" header | FR-003 |
| TC-004 | Successful logout | High | Functional | Verify logout process | 1. User logged in | 1. Click user dropdown<br>2. Select Logout | 1. Redirect to login page<br>2. Show login form | FR-004 |
| TC-005 | Session validation | Medium | Security | Verify session cleared after logout | 1. User logged out | 1. Access dashboard URL directly | 1. Redirect to login page | SEC-001 |
| TC-006 | Empty validation | High | Boundary | Verify empty input validation | 1. On login page | 1. Leave username empty<br>2. Leave password empty<br>3. Click Login | 1. Show "Required" on both fields | UI-001 |
| TC-007 | Case sensitivity | Medium | Security | Verify password case sensitivity | 1. On login page | 1. Input uppercase username<br>2. Input uppercase password<br>3. Click Login | 1. Show "Invalid credentials" | SEC-002 |
| TC-008 | Long input | Low | Boundary | Verify long input handling | 1. On login page | 1. Input 100-char username<br>2. Input 100-char password<br>3. Click Login | 1. System doesn't crash<br>2. Show appropriate error | UI-002 |
| TC-009 | Session timeout | High | Security | Verify inactivity timeout | 1. User logged in | 1. Wait 5 minutes<br>2. Access Admin menu | 1. Redirect to login page | SEC-003 |
| TC-010 | Concurrent login | Medium | Security | Verify multiple sessions | 1. - | 1. Login session 1<br>2. Login session 2 | 1. Both sessions active (demo app allows) | - |

### Test Attributes
1. **Test Case ID**: Unique TC-XXX identifier  
2. **Priority**: High/Medium/Low business impact  
3. **Test Type**: Functional/Boundary/Security  
4. **Traceability**: Linked to requirement IDs (FR-XXX, SEC-XXX, UI-XXX)

### Requirement Coverage
- **Functional**: FR-001 to FR-005  
- **Security**: SEC-001 to SEC-003  
- **UI**: UI-001 to UI-002  

### Test Data
- Valid: Admin/admin123  
- Invalid: wrong/wrong  
- Boundary:  
  - Empty strings  
  - 100-character strings  
  - Uppercase credentials  

### Test Environment
- **Browsers**: Chromium, Firefox, WebKit  
- **Base URL**: https://opensource-demo.orangehrmlive.com  
- **Tools**: Playwright v1.40+  

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
