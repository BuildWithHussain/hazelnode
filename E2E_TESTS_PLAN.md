# E2E Testing Implementation Plan for Hazelnode

## Overview

This document outlines the plan to implement end-to-end tests for Hazelnode using Playwright, based on analysis of [frappe/lms](https://github.com/frappe/lms) Cypress setup.

## Findings from frappe/lms

### CI/CD Setup (`.github/workflows/ui-tests.yml`)

- **Trigger**: Runs on PRs, push to main, and manual dispatch
- **Services**: MariaDB 10.8
- **Environment Setup**:
  1. Clone repo + setup Python/Node
  2. Add hostname to `/etc/hosts` (e.g., `lms.test`)
  3. Run helper scripts to install dependencies and setup bench/site
  4. Start bench server in background
  5. Run UI tests with `bench --site <site> run-ui-tests <app> --headless`

### Site Configuration (`site_config.json`)

Key settings:
```json
{
  "allow_tests": true,
  "enable_ui_tests": true,
  "host_name": "http://lms.test:8000"
}
```

### Cypress Configuration

- Custom commands for login (API-based), button clicks, dialog handling
- Test fixtures for file uploads (images, videos)
- Tests interact with Frappe UI components using selectors

### Test Patterns

1. **Login via API** - POST to `/api/method/login` (avoids slow UI login)
2. **Wait strategies** - `cy.wait()` after navigation/state changes
3. **Element selection** - Using labels, text content, ARIA attributes
4. **Assertions** - URL checks, element visibility, content verification

---

## Implementation Plan for Hazelnode (Playwright)

### Phase 1: Infrastructure Setup

#### 1.1 Directory Structure

```
hazelnode/
├── e2e/                           # Playwright test directory
│   ├── fixtures/                  # Test data (workflows, images)
│   ├── helpers/                   # Test utilities
│   │   ├── auth.ts                # Login helpers
│   │   ├── workflow.ts            # Workflow creation helpers
│   │   └── frappe.ts              # Frappe API utilities
│   ├── pages/                     # Page Object Models
│   │   ├── login.page.ts          # Login page
│   │   ├── workflow-list.page.ts  # Workflow list page
│   │   └── workflow-editor.page.ts # Workflow editor page
│   └── tests/                     # Test specifications
│       ├── auth.spec.ts           # Authentication tests
│       ├── workflow-crud.spec.ts  # Workflow CRUD operations
│       └── workflow-editor.spec.ts # Editor interactions
├── playwright.config.ts           # Playwright configuration
└── .github/
    ├── workflows/
    │   └── ui-tests.yml           # New UI tests workflow
    └── helper/
        ├── install_dependencies.sh # System dependencies
        ├── install.sh              # Bench/site setup
        └── site_config.json        # Test site configuration
```

#### 1.2 Package Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@types/node": "^22.0.0"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

#### 1.3 Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false, // Sequential for Frappe state consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Frappe
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://hazelnode.test:8000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  globalSetup: require.resolve('./e2e/helpers/global-setup'),
  globalTeardown: require.resolve('./e2e/helpers/global-teardown'),
});
```

### Phase 2: Core Helpers

#### 2.1 Authentication Helper (`e2e/helpers/auth.ts`)

```typescript
import { APIRequestContext, Page } from '@playwright/test';

export async function loginViaAPI(
  request: APIRequestContext,
  email: string = 'Administrator',
  password: string = 'admin'
): Promise<void> {
  await request.post('/api/method/login', {
    form: { usr: email, pwd: password }
  });
}

export async function loginViaUI(
  page: Page,
  email: string = 'Administrator',
  password: string = 'admin'
): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app/**');
}

export async function logout(page: Page): Promise<void> {
  await page.goto('/api/method/logout');
}
```

#### 2.2 Frappe API Helper (`e2e/helpers/frappe.ts`)

```typescript
import { APIRequestContext } from '@playwright/test';

export async function createDoc(
  request: APIRequestContext,
  doctype: string,
  doc: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await request.post('/api/resource/' + doctype, {
    data: doc
  });
  return response.json();
}

export async function deleteDoc(
  request: APIRequestContext,
  doctype: string,
  name: string
): Promise<void> {
  await request.delete(`/api/resource/${doctype}/${name}`);
}

export async function callMethod(
  request: APIRequestContext,
  method: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const response = await request.post(`/api/method/${method}`, {
    data: args
  });
  return response.json();
}
```

#### 2.3 Workflow Helpers (`e2e/helpers/workflow.ts`)

```typescript
import { APIRequestContext } from '@playwright/test';
import { createDoc, deleteDoc } from './frappe';

export interface WorkflowNode {
  node_id: string;
  node_type: string;
  position_x: number;
  position_y: number;
  params: Record<string, unknown>;
}

export async function createTestWorkflow(
  request: APIRequestContext,
  name: string,
  nodes: WorkflowNode[] = []
): Promise<string> {
  const doc = await createDoc(request, 'Hazel Workflow', {
    title: name,
    nodes: nodes
  });
  return doc.name as string;
}

export async function deleteTestWorkflow(
  request: APIRequestContext,
  name: string
): Promise<void> {
  await deleteDoc(request, 'Hazel Workflow', name);
}
```

### Phase 3: Page Objects

#### 3.1 Workflow Editor Page (`e2e/pages/workflow-editor.page.ts`)

```typescript
import { Page, Locator } from '@playwright/test';

export class WorkflowEditorPage {
  readonly page: Page;
  readonly canvas: Locator;
  readonly nodePanel: Locator;
  readonly saveButton: Locator;
  readonly runButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator('.react-flow');
    this.nodePanel = page.locator('[data-testid="node-panel"]');
    this.saveButton = page.locator('button:has-text("Save")');
    this.runButton = page.locator('button:has-text("Run")');
  }

  async goto(workflowId: string) {
    await this.page.goto(`/hazelnode/workflow/${workflowId}`);
    await this.canvas.waitFor({ state: 'visible' });
  }

  async dragNodeToCanvas(nodeType: string, x: number, y: number) {
    const node = this.nodePanel.locator(`[data-node-type="${nodeType}"]`);
    await node.dragTo(this.canvas, { targetPosition: { x, y } });
  }

  async selectNode(nodeId: string) {
    await this.canvas.locator(`[data-id="${nodeId}"]`).click();
  }

  async connectNodes(sourceId: string, targetId: string) {
    const sourceHandle = this.canvas.locator(
      `[data-id="${sourceId}"] [data-handleid="source"]`
    );
    const targetHandle = this.canvas.locator(
      `[data-id="${targetId}"] [data-handleid="target"]`
    );
    await sourceHandle.dragTo(targetHandle);
  }

  async save() {
    await this.saveButton.click();
    await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/') && resp.status() === 200
    );
  }

  async getNodeCount(): Promise<number> {
    return this.canvas.locator('.react-flow__node').count();
  }
}
```

### Phase 4: Test Specifications

#### 4.1 Authentication Tests (`e2e/tests/auth.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { loginViaAPI, loginViaUI, logout } from '../helpers/auth';

test.describe('Authentication', () => {
  test('should login via API', async ({ request, page }) => {
    await loginViaAPI(request);
    await page.goto('/hazelnode');
    await expect(page).toHaveURL(/.*hazelnode.*/);
  });

  test('should login via UI', async ({ page }) => {
    await loginViaUI(page);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/hazelnode');
    await expect(page).toHaveURL(/.*login.*/);
  });
});
```

#### 4.2 Workflow CRUD Tests (`e2e/tests/workflow-crud.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { loginViaAPI } from '../helpers/auth';
import { createTestWorkflow, deleteTestWorkflow } from '../helpers/workflow';

test.describe('Workflow CRUD', () => {
  test.beforeEach(async ({ request }) => {
    await loginViaAPI(request);
  });

  test('should create a new workflow', async ({ page }) => {
    await page.goto('/hazelnode');
    await page.click('button:has-text("New Workflow")');

    await page.fill('input[name="title"]', 'Test Workflow');
    await page.click('button:has-text("Create")');

    await expect(page).toHaveURL(/.*workflow\/.*/);
    await expect(page.locator('h1')).toContainText('Test Workflow');
  });

  test('should list existing workflows', async ({ request, page }) => {
    // Create test workflow via API
    const workflowName = await createTestWorkflow(request, 'List Test Workflow');

    await page.goto('/hazelnode');
    await expect(page.locator(`text=List Test Workflow`)).toBeVisible();

    // Cleanup
    await deleteTestWorkflow(request, workflowName);
  });

  test('should delete a workflow', async ({ request, page }) => {
    const workflowName = await createTestWorkflow(request, 'Delete Test Workflow');

    await page.goto('/hazelnode');
    await page.locator(`text=Delete Test Workflow`).click();
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    await expect(page.locator(`text=Delete Test Workflow`)).not.toBeVisible();
  });
});
```

#### 4.3 Workflow Editor Tests (`e2e/tests/workflow-editor.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { loginViaAPI } from '../helpers/auth';
import { createTestWorkflow, deleteTestWorkflow } from '../helpers/workflow';
import { WorkflowEditorPage } from '../pages/workflow-editor.page';

test.describe('Workflow Editor', () => {
  let workflowName: string;
  let editorPage: WorkflowEditorPage;

  test.beforeAll(async ({ request }) => {
    await loginViaAPI(request);
    workflowName = await createTestWorkflow(request, 'Editor Test Workflow');
  });

  test.afterAll(async ({ request }) => {
    await deleteTestWorkflow(request, workflowName);
  });

  test.beforeEach(async ({ page }) => {
    editorPage = new WorkflowEditorPage(page);
    await editorPage.goto(workflowName);
  });

  test('should display workflow editor canvas', async ({ page }) => {
    await expect(editorPage.canvas).toBeVisible();
  });

  test('should add a trigger node', async ({ page }) => {
    await editorPage.dragNodeToCanvas('webhook', 200, 200);
    await expect(await editorPage.getNodeCount()).toBe(1);
  });

  test('should add and connect nodes', async ({ page }) => {
    await editorPage.dragNodeToCanvas('webhook', 100, 200);
    await editorPage.dragNodeToCanvas('log', 300, 200);

    // Get node IDs and connect them
    const nodes = await page.locator('.react-flow__node').all();
    const sourceId = await nodes[0].getAttribute('data-id');
    const targetId = await nodes[1].getAttribute('data-id');

    await editorPage.connectNodes(sourceId!, targetId!);

    // Verify connection exists
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  });

  test('should save workflow changes', async ({ page }) => {
    await editorPage.dragNodeToCanvas('log', 200, 200);
    await editorPage.save();

    // Refresh and verify persistence
    await page.reload();
    await expect(await editorPage.getNodeCount()).toBeGreaterThan(0);
  });

  test('should configure node parameters', async ({ page }) => {
    await editorPage.dragNodeToCanvas('log', 200, 200);

    const node = page.locator('.react-flow__node').first();
    await node.dblclick();

    // Fill node configuration
    await page.fill('input[name="message"]', 'Test log message');
    await page.click('button:has-text("Apply")');

    await editorPage.save();
  });
});
```

### Phase 5: CI/CD Integration

#### 5.1 GitHub Workflow (`.github/workflows/ui-tests.yml`)

```yaml
name: UI Tests

on:
  pull_request:
  push:
    branches: [develop]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60

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
          python-version: '3.14'

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Add to Hosts
        run: echo "127.0.0.1 hazelnode.test" | sudo tee -a /etc/hosts

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/pyproject.toml') }}

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}

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

      - name: Install Hazelnode
        working-directory: /home/runner/frappe-bench
        run: |
          bench get-app hazelnode $GITHUB_WORKSPACE
          bench setup requirements --dev
          bench new-site --db-root-password root --admin-password admin hazelnode.test
          bench --site hazelnode.test install-app hazelnode
          bench build
        env:
          CI: "Yes"

      - name: Configure Site
        working-directory: /home/runner/frappe-bench
        run: |
          bench --site hazelnode.test set-config allow_tests true
          bench --site hazelnode.test set-config enable_ui_tests true
          bench --site hazelnode.test set-config host_name "http://hazelnode.test:8000"
          bench --site hazelnode.test execute frappe.utils.install.complete_setup_wizard
          bench --site hazelnode.test execute frappe.tests.ui_test_helpers.create_test_user

      - name: Start Server
        working-directory: /home/runner/frappe-bench
        run: |
          sed -i 's/^watch:/# watch:/g' Procfile
          sed -i 's/^schedule:/# schedule:/g' Procfile
          bench start &> bench_start.log &
          sleep 10

      - name: Install Playwright
        run: |
          cd $GITHUB_WORKSPACE
          npm ci
          npx playwright install --with-deps chromium

      - name: Run E2E Tests
        run: |
          cd $GITHUB_WORKSPACE
          npx playwright test
        env:
          BASE_URL: http://hazelnode.test:8000

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Show Bench Logs
        if: always()
        run: cat ~/frappe-bench/bench_start.log || true
```

### Phase 6: Implementation Checklist

#### 6.1 Initial Setup
- [ ] Add Playwright dependencies to `package.json`
- [ ] Create `playwright.config.ts`
- [ ] Create directory structure (`e2e/tests`, `e2e/helpers`, `e2e/pages`)
- [ ] Create `.github/workflows/ui-tests.yml`

#### 6.2 Core Helpers
- [ ] Implement `auth.ts` - login/logout helpers
- [ ] Implement `frappe.ts` - Frappe API utilities
- [ ] Implement `workflow.ts` - Workflow creation/deletion
- [ ] Implement global setup/teardown

#### 6.3 Page Objects
- [ ] Create `workflow-list.page.ts`
- [ ] Create `workflow-editor.page.ts`
- [ ] Create `login.page.ts`

#### 6.4 Tests
- [ ] Authentication tests
- [ ] Workflow list/CRUD tests
- [ ] Workflow editor interaction tests
- [ ] Node configuration tests
- [ ] Workflow execution tests

#### 6.5 Data Test Attributes
- [ ] Add `data-testid` attributes to key frontend components
- [ ] Document selector strategy in test utilities

---

## Key Differences: Cypress vs Playwright

| Aspect | Cypress (frappe/lms) | Playwright (Hazelnode) |
|--------|---------------------|------------------------|
| Syntax | `cy.get().click()` | `page.locator().click()` |
| Async | Implicit chaining | Explicit async/await |
| API Testing | `cy.request()` | `request.post()` |
| Parallel | Harder to configure | Built-in support |
| Browser support | Chrome-focused | Multi-browser |
| Test isolation | Cookie-based | Context-based |

## Playwright Advantages for Hazelnode

1. **TypeScript-first** - Better IDE support, matches frontend stack
2. **Better async handling** - Cleaner code with async/await
3. **Multi-browser testing** - Chromium, Firefox, WebKit
4. **Auto-waiting** - Built-in smart waiting for elements
5. **Trace viewer** - Superior debugging with traces
6. **API testing built-in** - First-class support for API calls

## Notes

- Tests should be idempotent (create own data, clean up after)
- Use API calls for setup/teardown, UI for actual testing
- Avoid hard-coded waits; use Playwright's auto-waiting
- Add `data-testid` attributes to critical UI elements for stable selectors
