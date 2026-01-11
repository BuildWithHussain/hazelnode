import { test, expect } from '@playwright/test';
import { WorkflowListPage } from '../pages';
import {
	createTestWorkflow,
	deleteTestWorkflow,
	generateWorkflowTitle,
	getWorkflow,
} from '../helpers';

/**
 * Workflow CRUD tests.
 * Authentication is handled by the setup project - tests run pre-authenticated.
 */
test.describe('Workflow CRUD Operations', () => {

	test('should display workflow list page', async ({ page }) => {
		const listPage = new WorkflowListPage(page);

		await listPage.goto();
		await listPage.expectPageLoaded();
	});

	test('should create a new workflow via UI', async ({ page, request }) => {
		const listPage = new WorkflowListPage(page);
		const workflowTitle = generateWorkflowTitle('UI Create');

		await listPage.goto();
		await listPage.createWorkflow(workflowTitle);

		// Should navigate to editor
		await expect(page).toHaveURL(/.*workflow\/.*/);

		// Verify workflow was created via API
		const urlParts = page.url().split('/');
		const workflowId = urlParts[urlParts.length - 1];

		const workflow = await getWorkflow(request, workflowId);
		expect(workflow.title).toBe(workflowTitle);

		// Cleanup
		await deleteTestWorkflow(request, workflowId);
	});

	test('should list existing workflows', async ({ request, page }) => {
		const listPage = new WorkflowListPage(page);
		const workflowTitle = generateWorkflowTitle('List Test');

		// Create workflow via API
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			await listPage.goto();
			await listPage.expectWorkflowVisible(workflowTitle);
		} finally {
			// Cleanup
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should navigate to workflow editor when clicking a workflow', async ({
		request,
		page,
	}) => {
		const listPage = new WorkflowListPage(page);
		const workflowTitle = generateWorkflowTitle('Click Test');

		// Create workflow via API
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			await listPage.goto();
			await listPage.clickWorkflow(workflowTitle);

			// Should navigate to editor
			await expect(page).toHaveURL(new RegExp(`.*workflow/${workflowName}.*`));
		} finally {
			// Cleanup
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should toggle workflow enabled state', async ({ request, page }) => {
		const listPage = new WorkflowListPage(page);
		const workflowTitle = generateWorkflowTitle('Toggle Test');

		// Create workflow via API
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			await listPage.goto();

			// Toggle enabled state
			await listPage.toggleWorkflowEnabled(workflowTitle);

			// Verify state changed via API
			const workflow = await getWorkflow(request, workflowName);
			// Initial state should be 0, after toggle should be 1
			expect(workflow.enabled).toBe(1);

			// Toggle back
			await listPage.toggleWorkflowEnabled(workflowTitle);

			const updatedWorkflow = await getWorkflow(request, workflowName);
			expect(updatedWorkflow.enabled).toBe(0);
		} finally {
			// Cleanup
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should cancel workflow creation dialog', async ({ page }) => {
		const listPage = new WorkflowListPage(page);

		await listPage.goto();
		await listPage.openCreateDialog();

		// Dialog should be visible
		await expect(listPage.createDialog).toBeVisible();

		// Cancel
		await listPage.closeCreateDialog();

		// Dialog should be hidden
		await expect(listPage.createDialog).toBeHidden();

		// Should still be on list page
		await listPage.expectPageLoaded();
	});

	test('should create workflow via API and verify in list', async ({
		request,
		page,
	}) => {
		const listPage = new WorkflowListPage(page);
		const workflowTitle = generateWorkflowTitle('API Create');

		// Create via API
		const workflowName = await createTestWorkflow(request, workflowTitle, {
			description: 'Created via API for testing',
		});

		try {
			await listPage.goto();

			// Should appear in list
			const exists = await listPage.workflowExists(workflowTitle);
			expect(exists).toBe(true);
		} finally {
			// Cleanup
			await deleteTestWorkflow(request, workflowName);
		}
	});
});
