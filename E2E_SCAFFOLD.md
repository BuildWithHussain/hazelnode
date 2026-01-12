# Playwright E2E Testing Scaffold for Frappe Apps

A reusable template for setting up end-to-end tests with Playwright in Frappe Framework applications.

## Quick Start

```bash
# 1. Copy the e2e directory structure to your app
# 2. Install dependencies
npm install -D @playwright/test
npx playwright install chromium

# 3. Update configuration for your app
# 4. Run tests
npx playwright test
```

## Directory Structure

```
your-frappe-app/
├── e2e/
│   ├── .auth/                    # Generated auth state (gitignored)
│   │   ├── user.json             # Browser storage state
│   │   └── csrf.json             # CSRF token for API calls
│   ├── helpers/
│   │   ├── index.ts              # Re-exports all helpers
│   │   ├── auth.ts               # Authentication utilities
│   │   └── frappe.ts             # Frappe REST API utilities
│   ├── pages/
│   │   ├── index.ts              # Re-exports all page objects
│   │   └── login.page.ts         # Frappe login page object
│   └── tests/
│       ├── auth.setup.ts         # Auth setup project
│       └── example.spec.ts       # Your test files
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies
└── .github/
    └── workflows/
        └── ui-tests.yml          # CI workflow
```

## Files to Create

### 1. `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'html',
  timeout: 60000,

  expect: {
    timeout: 10000,
  },

  use: {
    // Update with your app's base URL
    baseURL: process.env.BASE_URL || 'http://your-site.test:8000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
});
```

### 2. `e2e/tests/auth.setup.ts`

```typescript
import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authFile = 'e2e/.auth/user.json';
const csrfFile = 'e2e/.auth/csrf.json';

/**
 * Authentication setup - runs once before all tests.
 * Handles Frappe login and CSRF token extraction.
 */
setup('authenticate', async ({ page }) => {
  // Ensure auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Login via Frappe API
  const loginResponse = await page.request.post('/api/method/login', {
    form: {
      usr: process.env.FRAPPE_USER || 'Administrator',
      pwd: process.env.FRAPPE_PASSWORD || 'admin',
    },
  });
  expect(loginResponse.ok()).toBeTruthy();

  // Verify login
  const userResponse = await page.request.get(
    '/api/method/frappe.auth.get_logged_user'
  );
  expect(userResponse.ok()).toBeTruthy();
  const userData = await userResponse.json();
  expect(userData.message).not.toBe('Guest');
  console.log(`✅ Authenticated as: ${userData.message}`);

  // Navigate to app to get CSRF token from window.frappe.csrf_token
  await page.goto('/app');
  await page.waitForLoadState('networkidle');

  // Extract CSRF token (required for API calls)
  const csrfToken = await page.evaluate(() => {
    return (window as any).frappe?.csrf_token;
  });

  if (csrfToken) {
    fs.writeFileSync(csrfFile, JSON.stringify({ csrf_token: csrfToken }));
    console.log(`🔐 Saved CSRF token`);
  } else {
    console.warn('⚠️ Could not extract CSRF token');
  }

  // Save authentication state
  await page.context().storageState({ path: authFile });
  console.log(`💾 Saved auth state`);
});
```

### 3. `e2e/helpers/frappe.ts`

```typescript
import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';

const CSRF_FILE = 'e2e/.auth/csrf.json';
let csrfTokenCache: string | null = null;

/**
 * Get CSRF token from saved file.
 */
function getCsrfToken(): string {
  if (csrfTokenCache !== null) return csrfTokenCache;
  try {
    if (fs.existsSync(CSRF_FILE)) {
      const data = JSON.parse(fs.readFileSync(CSRF_FILE, 'utf-8'));
      csrfTokenCache = data.csrf_token || '';
      return csrfTokenCache;
    }
  } catch (error) {
    console.warn('Failed to read CSRF token:', error);
  }
  csrfTokenCache = '';
  return '';
}

/**
 * Get default headers for Frappe API calls.
 */
function getHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { 'X-Frappe-CSRF-Token': token } : {}),
  };
}

/**
 * Create a new Frappe document.
 */
export async function createDoc(
  request: APIRequestContext,
  doctype: string,
  data: Record<string, any>
): Promise<any> {
  const response = await request.post(
    `/api/resource/${encodeURIComponent(doctype)}`,
    {
      headers: getHeaders(),
      data,
    }
  );

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to create ${doctype}: ${error}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get a Frappe document by name.
 */
export async function getDoc(
  request: APIRequestContext,
  doctype: string,
  name: string
): Promise<any> {
  const response = await request.get(
    `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    { headers: getHeaders() }
  );

  if (!response.ok()) {
    throw new Error(`Failed to get ${doctype}/${name}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update a Frappe document.
 */
export async function updateDoc(
  request: APIRequestContext,
  doctype: string,
  name: string,
  data: Record<string, any>
): Promise<any> {
  const response = await request.put(
    `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    {
      headers: getHeaders(),
      data,
    }
  );

  if (!response.ok()) {
    throw new Error(`Failed to update ${doctype}/${name}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a Frappe document.
 */
export async function deleteDoc(
  request: APIRequestContext,
  doctype: string,
  name: string
): Promise<void> {
  const response = await request.delete(
    `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    { headers: getHeaders() }
  );

  if (!response.ok()) {
    const error = await response.text();
    // Ignore "not found" errors during cleanup
    if (!error.includes('DoesNotExistError')) {
      console.warn(`Failed to delete ${doctype}/${name}: ${error}`);
    }
  }
}

/**
 * Call a Frappe whitelisted method.
 */
export async function callMethod(
  request: APIRequestContext,
  method: string,
  args: Record<string, any> = {}
): Promise<any> {
  const response = await request.post(`/api/method/${method}`, {
    headers: getHeaders(),
    data: args,
  });

  if (!response.ok()) {
    throw new Error(`Failed to call ${method}`);
  }

  const result = await response.json();
  return result.message;
}
```

### 4. `e2e/helpers/index.ts`

```typescript
export * from './frappe';

/**
 * Generate a unique title with timestamp for test isolation.
 */
export function generateTestTitle(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}
```

### 5. `e2e/pages/login.page.ts`

```typescript
import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Frappe login page.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Standard Frappe login selectors
    this.emailInput = page.locator('#login_email');
    this.passwordInput = page.locator('#login_password');
    this.submitButton = page.locator('button.btn-login');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // Wait for redirect after login
    await this.page.waitForURL(/.*\/app.*|.*\/desk.*/);
  }

  async expectLoginPage(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
```

### 6. `e2e/pages/index.ts`

```typescript
export * from './login.page';
// Export your other page objects here
```

### 7. `e2e/tests/example.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { createDoc, deleteDoc, generateTestTitle } from '../helpers';

test.describe('Example Tests', () => {
  test('should load the app', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveTitle(/Frappe/);
  });

  test('should create and delete a document via API', async ({ request }) => {
    const title = generateTestTitle('Test Doc');

    // Create document via API
    const doc = await createDoc(request, 'Your Doctype', {
      title,
      // ... other fields
    });

    expect(doc.name).toBeTruthy();

    // Cleanup
    await deleteDoc(request, 'Your Doctype', doc.name);
  });
});
```

### 8. `.github/workflows/ui-tests.yml`

```yaml
name: UI Tests

on:
  push:
    branches:
      - develop
      - main
  pull_request:
  workflow_dispatch:

concurrency:
  group: ui-tests-${{ github.event.number || github.ref }}
  cancel-in-progress: true

jobs:
  ui-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    name: Playwright E2E Tests

    services:
      redis-cache:
        image: redis:alpine
        ports:
          - 13000:6379
      redis-queue:
        image: redis:alpine
        ports:
          - 11000:6379
      mariadb:
        image: mariadb:10.6
        env:
          MYSQL_ROOT_PASSWORD: root
        ports:
          - 3306:3306
        options: --health-cmd="mariadb-admin ping" --health-interval=5s --health-timeout=2s --health-retries=3

    steps:
      - name: Clone
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          check-latest: true

      - name: Add to Hosts
        run: echo "127.0.0.1 test-site.localhost" | sudo tee -a /etc/hosts

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/*requirements.txt', '**/pyproject.toml') }}
          restore-keys: ${{ runner.os }}-pip-

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package.json') }}
          restore-keys: ${{ runner.os }}-playwright-

      - name: Install MariaDB Client
        run: |
          sudo apt update
          sudo apt-get install mariadb-client

      - name: Setup Bench
        run: |
          pip install frappe-bench
          bench init --skip-redis-config-generation --skip-assets --python "$(which python)" ~/frappe-bench
          mariadb --host 127.0.0.1 --port 3306 -u root -proot -e "SET GLOBAL character_set_server = 'utf8mb4'"
          mariadb --host 127.0.0.1 --port 3306 -u root -proot -e "SET GLOBAL collation_server = 'utf8mb4_unicode_ci'"

      - name: Install App
        working-directory: /home/runner/frappe-bench
        run: |
          # Update YOUR_APP_NAME below
          bench get-app YOUR_APP_NAME $GITHUB_WORKSPACE
          bench setup requirements --dev
          bench new-site --db-root-password root --admin-password admin test-site.localhost
          bench --site test-site.localhost install-app YOUR_APP_NAME
          bench build
        env:
          CI: "Yes"

      - name: Configure Site
        working-directory: /home/runner/frappe-bench
        run: |
          bench --site test-site.localhost set-config allow_tests true
          bench --site test-site.localhost set-config host_name "http://test-site.localhost:8000"

      - name: Start Frappe Server
        working-directory: /home/runner/frappe-bench
        run: |
          sed -i 's/^watch:/# watch:/g' Procfile
          sed -i 's/^schedule:/# schedule:/g' Procfile
          bench start &> bench_start.log &
          echo "Waiting for server..."
          timeout 60 bash -c 'until curl -s http://test-site.localhost:8000 > /dev/null; do sleep 2; done'
          echo "Server ready!"

      - name: Install Playwright
        run: |
          npm install
          npx playwright install --with-deps chromium

      - name: Run Playwright Tests
        run: npx playwright test
        env:
          BASE_URL: http://test-site.localhost:8000
          FRAPPE_USER: Administrator
          FRAPPE_PASSWORD: admin

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-results/
          retention-days: 7

      - name: Show Logs on Failure
        if: failure()
        working-directory: /home/runner/frappe-bench
        run: |
          echo "=== Bench Start Log ==="
          cat bench_start.log || true
          echo "=== Frappe Logs ==="
          cat logs/*.log || true
```

### 9. Update `package.json`

Add to your package.json:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 10. Update `.gitignore`

Add:

```
# Playwright
e2e/.auth/
playwright-report/
test-results/
```

## Key Patterns

### HeadlessUI Dialog Handling

HeadlessUI dialogs can leave `role="dialog"` in DOM during transitions. Use content-based selectors:

```typescript
// ❌ May match hidden dialog
this.dialog = page.locator('[role="dialog"]');

// ✅ Match visible content
this.dialog = page.locator('text=Dialog Title');
```

### Force Clicks for Overlays

When overlays intercept clicks:

```typescript
await button.click({ force: true });
```

### Waiting for ReactFlow

ReactFlow needs time to initialize:

```typescript
async waitForEditorReady(): Promise<void> {
  await this.page.waitForLoadState('domcontentloaded');
  await this.canvas.waitFor({ state: 'visible', timeout: 30000 });
  await this.page.waitForLoadState('networkidle');
  await this.controls.waitFor({ state: 'visible', timeout: 15000 });
}
```

### Test Isolation

Always create unique test data and clean up:

```typescript
test('example', async ({ request }) => {
  const name = await createDoc(request, 'Doctype', { title: `Test ${Date.now()}` });
  try {
    // Test logic
  } finally {
    await deleteDoc(request, 'Doctype', name);
  }
});
```

## Customization Checklist

1. [ ] Update `playwright.config.ts` with your base URL
2. [ ] Update CI workflow with your app name
3. [ ] Create page objects for your app's pages
4. [ ] Create helper functions for your doctypes
5. [ ] Update `.gitignore` with auth files
6. [ ] Add test scripts to `package.json`

## Troubleshooting

### CSRF Token Error
- Ensure auth setup navigates to `/app` after login
- Check that `window.frappe.csrf_token` is available
- Verify the CSRF token file is being saved

### Login Failures
- Use Frappe's standard IDs: `#login_email`, `#login_password`
- Check credentials in environment variables

### Timeout Errors
- Increase `actionTimeout` and `navigationTimeout`
- Add explicit waits for dynamic content
- Use `networkidle` for API-heavy pages

### Dialog Not Found
- Use content-based selectors instead of `role="dialog"`
- Account for HeadlessUI transition timing
