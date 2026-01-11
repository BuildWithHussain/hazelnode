import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Hazelnode workflow list page.
 */
export class WorkflowListPage {
	readonly page: Page;
	readonly pageTitle: Locator;
	readonly newWorkflowButton: Locator;
	readonly workflowTable: Locator;
	readonly workflowRows: Locator;
	readonly loadingSkeleton: Locator;
	readonly errorMessage: Locator;

	// Create dialog elements
	readonly createDialog: Locator;
	readonly titleInput: Locator;
	readonly createButton: Locator;
	readonly cancelButton: Locator;

	constructor(page: Page) {
		this.page = page;

		// List page elements
		this.pageTitle = page.locator('text=Your Workflows');
		this.newWorkflowButton = page.locator('button:has-text("New Workflow")');
		this.workflowTable = page.locator('table');
		this.workflowRows = page.locator('table tbody tr');
		this.loadingSkeleton = page.locator('[class*="skeleton"]');
		this.errorMessage = page.locator('text=Error loading workflows');

		// Create dialog elements - HeadlessUI dialog panel
		// Use content-based selectors as HeadlessUI transitions can leave role="dialog" in DOM
		this.createDialog = page.locator('text=Create new workflow');
		// Input has id="title"
		this.titleInput = page.locator('input#title');
		this.createButton = page.locator('button:has-text("Create"):not(:has-text("Creating"))');
		this.cancelButton = page.locator('button:has-text("Cancel")');
	}

	/**
	 * Navigate to the workflow list page.
	 */
	async goto(): Promise<void> {
		await this.page.goto('/hazelnode');
		await this.waitForLoaded();
	}

	/**
	 * Wait for the page to finish loading.
	 */
	async waitForLoaded(): Promise<void> {
		// Wait for DOM to settle
		await this.page.waitForLoadState('domcontentloaded');
		// Wait for page title and button (appear even during loading)
		await this.pageTitle.waitFor({ state: 'visible', timeout: 30000 });
		await this.newWorkflowButton.waitFor({ state: 'visible', timeout: 10000 });
		// Wait for network to settle
		await this.page.waitForLoadState('networkidle');
		// Wait for either the table or error message to confirm data loaded
		await Promise.race([
			this.workflowTable.waitFor({ state: 'visible', timeout: 30000 }),
			this.errorMessage.waitFor({ state: 'visible', timeout: 30000 }),
		]).catch(() => {
			// May already be visible
		});
	}

	/**
	 * Open the create workflow dialog.
	 */
	async openCreateDialog(): Promise<void> {
		// Ensure button is visible and enabled
		await this.newWorkflowButton.waitFor({ state: 'visible', timeout: 10000 });
		await expect(this.newWorkflowButton).toBeEnabled();
		await this.newWorkflowButton.click();
		// Wait for dialog title to appear (HeadlessUI transitions)
		await this.createDialog.waitFor({ state: 'visible', timeout: 15000 });
		// Wait for input to be visible and interactable
		await this.titleInput.waitFor({ state: 'visible', timeout: 5000 });
	}

	/**
	 * Create a new workflow via the dialog.
	 */
	async createWorkflow(title: string): Promise<void> {
		await this.openCreateDialog();
		await this.titleInput.fill(title);
		await this.createButton.click();
		// Wait for navigation to editor page
		await this.page.waitForURL(/.*workflow\/.*/, { timeout: 30000 });
	}

	/**
	 * Close the create dialog without creating.
	 */
	async closeCreateDialog(): Promise<void> {
		await this.cancelButton.click();
		// Wait for dialog title to disappear
		await this.createDialog.waitFor({ state: 'hidden', timeout: 5000 });
	}

	/**
	 * Get the number of workflows displayed.
	 */
	async getWorkflowCount(): Promise<number> {
		return this.workflowRows.count();
	}

	/**
	 * Click on a workflow by its title.
	 */
	async clickWorkflow(title: string): Promise<void> {
		await this.page.locator(`table tr:has-text("${title}")`).click();
		await this.page.waitForURL(/.*workflow\/.*/, { timeout: 30000 });
	}

	/**
	 * Toggle the enabled state of a workflow.
	 */
	async toggleWorkflowEnabled(title: string): Promise<void> {
		const row = this.page.locator(`table tr:has-text("${title}")`);
		const toggle = row.locator('button[role="switch"]');
		await toggle.click();
		// Wait for API response
		await this.page.waitForResponse(
			(resp) =>
				resp.url().includes('/api/resource/Hazel%20Workflow') &&
				resp.request().method() === 'PUT'
		);
	}

	/**
	 * Check if a workflow exists in the list.
	 */
	async workflowExists(title: string): Promise<boolean> {
		const row = this.page.locator(`table tr:has-text("${title}")`);
		return (await row.count()) > 0;
	}

	/**
	 * Assert that the page loaded successfully.
	 */
	async expectPageLoaded(): Promise<void> {
		await expect(this.pageTitle).toBeVisible();
		await expect(this.newWorkflowButton).toBeVisible();
	}

	/**
	 * Assert that a workflow is visible in the list.
	 */
	async expectWorkflowVisible(title: string): Promise<void> {
		await expect(this.page.locator(`table tr:has-text("${title}")`)).toBeVisible();
	}
}
