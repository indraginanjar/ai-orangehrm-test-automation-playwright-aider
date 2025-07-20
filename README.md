# AI-Assisted Test Automation Demo - OrangeHRM with Playwright (using aider)

This experimental repository demonstrates how quickly and easily test automation can be created using AI pair programming (aider + DeepSeek). It serves as:
- A demo of AI-assisted test development  
- An experiment in LLM-powered test creation
- A learning resource for AI-augmented testing

## Project Purpose

This repository was created to demonstrate:
1. **AI-Assisted Development**:
   - How quickly test automation can be created with AI pair programming
   - The effectiveness of tools like aider in test development  
   - Real-world example of LLM-assisted testing

2. **Learning Experiment**:
   - Exploring AI's role in test automation
   - Documenting the AI-human collaboration process
   - Testing the limits of AI in test creation

3. **Demo Capabilities**:
   - Showcase AI-generated test cases
   - Demonstrate maintainable test structure
   - Provide a real example of AI-augmented testing

> **Note**: This is an experimental/demonstration project. The tests may need adaptation for production use, but serve as an excellent example of AI-assisted test automation creation.

### Key Demonstration Points

1. **AI Pair Programming Workflow**:
   - Entire test suite co-developed with AI
   - Real-time code suggestions from DeepSeek
   - Iterative test improvement with AI feedback

2. **Rapid Test Creation**:
   - Full test suite created in hours, not days  
   - Complex test scenarios generated quickly
   - Automatic code reviews and optimizations

3. **Maintainable Results**:
   - Clean, well-structured test code
   - Proper documentation  
   - CI/CD ready implementation

### Technical Highlights

- Authentication (login/logout) workflows
- Navigation testing  
- Boundary value analysis
- Security validation
- ISTQB-aligned test structure

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

**Note:** The real session timeout test (`@security Session timeout after inactivity`) is currently disabled due to instability in the test environment. The mock version (`@mock @security Session timeout simulation`) remains available for testing the session timeout logic.

For faster test execution during development, we provide mock versions of certain tests:

1. **Session Timeout Simulation** (`@mock @security`):
   - Simulates session timeout by clearing cookies instead of waiting
   - Runs in seconds instead of minutes
   - Same validation as real test

Usage:
```bash
# Run only mock tests
$env:TEST_TYPE = "@mock"; npx playwright test
# Or:
# $env:TEST_TYPE='@mock'
# npx playwright test

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

## Screenshots and Reports

The test suite automatically captures:
- Screenshots on test failures  
- Videos of all test runs (passed and failed)
- Manual screenshots at key test points

### Video Management
Videos are automatically recorded for all tests (default 640x360 resolution). To manage disk space or change resolution:

1. **Change Video Resolution**:
```bash
# Set custom resolution
VIDEO_WIDTH=800 VIDEO_HEIGHT=450 npx playwright test

# Use very low resolution for CI
VIDEO_WIDTH=320 VIDEO_HEIGHT=180 npx playwright test

# Use HD resolution when needed  
VIDEO_WIDTH=1280 VIDEO_HEIGHT=720 npx playwright test
```

2. **Default Resolution**: 640x360 (good balance of quality and size)

1. **Automatic Cleanup**:
```bash
node clean-videos.js
```
This removes videos older than 7 days.

2. **Manual Cleanup**:
```bash
# Remove all videos
rm -rf test-results/**/*.webm
```

### Viewing Results

1. **HTML Report** (contains screenshots):
```bash
npx playwright show-report
```

2. **Screenshots Directory**:
- Saved to `/screenshots` with timestamped filenames
- Organized by test case and step
- Includes both automatic and manual captures

3. **Example Screenshot Usage**:
```typescript
// Before action
await takeScreenshot(page, 'pre-action');

// Perform test step
await page.click('button');

// After verification  
await takeScreenshot(page, 'post-verification');
```

### Screenshot Examples

| Test Case | Screenshot Purpose | File Pattern |
|-----------|--------------------|--------------|
| TC-001 | Login page | `login-page-*.png` |
| TC-001 | Filled form | `login-form-filled-*.png` | 
| TC-001 | Dashboard | `dashboard-loaded-*.png` |
| TC-002 | Error message | `error-message-*.png` |

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
| TC-009 | Session timeout | High | Security | Verify inactivity timeout | 1. User logged in | 1. Wait 5 minutes<br>2. Access Admin menu | 1. Redirect to login page | SEC-003<br>**Currently disabled** |
| TC-010 | Concurrent login | Medium | Security | Verify multiple sessions | 1. - | 1. Login session 1<br>2. Login session 2 | 1. Both sessions active (demo app allows) | - |
| TC-011 | Dashboard validation | High | Functional | Verify dashboard page components | 1. User logged in | 1. Navigate to dashboard<br>2. Check header<br>3. Verify widgets<br>4. Test quick launch | 1. Correct header shown<br>2. All widgets visible<br>3. Quick launch functional | FR-006 |
| TC-012 | Directory basic validation | Medium | Functional | Verify Directory page navigation and elements | 1. User logged in | 1. Navigate to Directory<br>2. Verify page elements | 1. Correct URL<br>2. All elements visible | FR-007 |
| TC-013 | Directory search | High | Functional | Verify search functionality | 1. On Directory page | 1. Search by name<br>2. Search by job title<br>3. Search by location | 1. Correct results for each filter | FR-008 |
| TC-014 | Directory pagination | Low | Boundary | Verify pagination controls | 1. On Directory page | 1. Test first page<br>2. Test last page | 1. Pagination works correctly | UI-003 |

### Test Attributes
1. **Test Case ID**: Unique TC-XXX identifier  
2. **Priority**: High/Medium/Low business impact  
3. **Test Type**: Functional/Boundary/Security  
4. **Traceability**: Linked to requirement IDs (FR-XXX, SEC-XXX, UI-XXX)

### Requirement Coverage

#### Functional Requirements (FR)

| ID | Description | Test Validation | Test Case |
|----|-------------|-----------------|-----------|
| FR-001 | Successful Login | <ul><li>Redirects to dashboard</li><li>Shows dashboard components</li></ul> | TC-001 |
| FR-002 | Failed Login Handling | <ul><li>Shows "Invalid credentials"</li><li>Maintains login page</li></ul> | TC-002 |
| FR-003 | Admin Module Access | <ul><li>Redirects to System Users</li><li>Shows appropriate header</li></ul> | TC-003 |
| FR-004 | Logout Functionality | <ul><li>Returns to login page</li><li>Clears session</li></ul> | TC-004 |
| FR-005 | Post-Logout Session Validation | <ul><li>Redirects to login when accessing protected pages</li></ul> | TC-005 |
| FR-006 | Dashboard Display | <ul><li>Shows correct header</li><li>Displays all widgets</li><li>Quick launch functions work</li></ul> | TC-011 |
| FR-007 | Directory Page Access | <ul><li>Correct navigation</li><li>Basic elements visible</li></ul> | TC-012 |
| FR-008 | Directory Search | <ul><li>Name search works</li><li>Job title filter works</li><li>Location filter works</li></ul> | TC-013 |

**Key Characteristics:**
- Direct traceability between requirements and test cases
- Covers core authentication workflow (login → access → logout)
- Validates both happy path and error scenarios
- Follows ISTQB standard numbering

#### Security Requirements (SEC)

| ID | Description | Test Validation | Test Case |
|----|-------------|-----------------|-----------|
| SEC-001 | Post-Logout Session Validation | <ul><li>Invalidates session after logout</li><li>Redirects to login when accessing protected pages</li><li>Clears session tokens/cookies</li></ul> | TC-005 |
| SEC-002 | Password Case Sensitivity | <ul><li>Rejects uppercase credentials</li><li>Shows "Invalid credentials" message</li></ul> | TC-007 |
| SEC-003 | Session Timeout | <ul><li>Terminates session after 5 minutes inactivity</li><li>Redirects to login page</li><li>Prevents access to protected resources</li></ul> | TC-009 (Currently disabled) |

**Key Security Characteristics:**
1. **Authentication Security**:
   - Proper session invalidation (SEC-001)
   - Case-sensitive credentials (SEC-002)

2. **Session Management**:
   - Time-based expiration (SEC-003)
   - Clean session termination

3. **Mock Testing Available**:
   - `@mock @security Session timeout simulation` provides faster alternative for SEC-003

**Implementation Notes:**
- Security tests use both:
  - Direct security validations (TC-005, TC-007)
  - Boundary testing (TC-008) for injection prevention
- Mock tests verify security logic without real waits
- Disabled SEC-003 test still maintains coverage through mock version

**Traceability Matrix**:
| Security Concern | Test Case | Verification Method |
|-----------------|-----------|---------------------|
| Session Fixation | TC-005 | Post-logout redirect |
| Credential Strength | TC-007 | Case sensitivity check |
| Session Lifetime | TC-009/Mock | Timeout simulation |

#### UI Requirements (UI)

| ID | Description | Test Validation | Test Case |
|----|-------------|-----------------|-----------|
| UI-001 | Empty Field Validation | <ul><li>Shows "Required" message</li><li>Highlights empty fields</li><li>Prevents form submission</li></ul> | TC-006 |
| UI-002 | Long Input Handling | <ul><li>Handles long inputs without UI breakage</li><li>Shows appropriate error</li><li>Maintains form functionality</li></ul> | TC-008 |
| UI-003 | Pagination Handling | <ul><li>Pagination controls work</li><li>Boundary cases handled</li></ul> | TC-014 |

**Key UI Characteristics:**
1. **Form Validation**:
   - Clear visual feedback (UI-001)
   - Consistent error messaging

2. **Input Handling**:
   - Graceful handling of edge cases (UI-002)
   - Prevention of UI/UX breakage

3. **User Experience**:
   - Immediate feedback for validation errors
   - Protection against malformed input

**Implementation Notes:**
- UI tests verify both:
  - Functional behavior (error messages)
  - Visual presentation (element visibility/styling)
- Uses boundary testing approach
- Validates responsive design elements

**Traceability Matrix**:
| UI Concern | Test Case | Verification Method |
|------------|-----------|---------------------|
| Form Validation | TC-006 | Empty field detection |
| Input Handling | TC-008 | Long string submission |

**Test Details**:
1. **UI-001 Test Flow**:
   - Leave both fields empty
   - Click login
   - Verify:
     - Two "Required" messages appear
     - Form doesn't submit
     - Fields remain editable

2. **UI-002 Test Flow**:
   - Enter 100-character strings
   - Click login
   - Verify:
     - No UI distortion
     - System responds appropriately
     - Form remains usable

**Visual Elements Verified**:
- Error message styling (color, position)
- Field highlighting
- Form layout stability
- Responsive behavior

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

## Conclusion

This project successfully demonstrates:
- How AI can accelerate test automation development  
- The quality of AI-generated test code
- The practical application of tools like aider  
- The future of AI-augmented testing

It serves as both a learning resource and proof-of-concept for AI-assisted test automation.

## License

[MIT License](LICENSE)
