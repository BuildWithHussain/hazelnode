import { test, expect } from '@playwright/test';
import { WorkflowEditorPage } from '../pages';
import {
	createTestWorkflow,
	deleteTestWorkflow,
	generateWorkflowTitle,
	createWebhookWorkflow,
	createWebhookLogWorkflow,
} from '../helpers';

/**
 * Workflow Editor tests.
 * Authentication is handled by the setup project - tests run pre-authenticated.
 */
test.describe('Workflow Editor', () => {

	test('should display workflow editor canvas', async ({ request, page }) => {
		const workflowTitle = generateWorkflowTitle('Editor Canvas');
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			await editorPage.expectEditorVisible();
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should display existing nodes from workflow', async ({
		request,
		page,
	}) => {
		const workflowTitle = generateWorkflowTitle('Existing Nodes');
		const workflowName = await createWebhookWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Wait for nodes to render
			await page.waitForTimeout(1000);

			// Should have at least one node (the webhook trigger)
			const nodeCount = await editorPage.getNodeCount();
			expect(nodeCount).toBeGreaterThanOrEqual(1);
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should display existing edges from workflow', async ({
		request,
		page,
	}) => {
		const workflowTitle = generateWorkflowTitle('Existing Edges');
		const workflowName = await createWebhookLogWorkflow(
			request,
			workflowTitle
		);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Wait for edges to render
			await page.waitForTimeout(1000);

			// Should have at least one edge connecting the nodes
			const edgeCount = await editorPage.getEdgeCount();
			expect(edgeCount).toBeGreaterThanOrEqual(1);
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should show node palette with draggable nodes', async ({
		request,
		page,
	}) => {
		const workflowTitle = generateWorkflowTitle('Node Palette');
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Check for draggable nodes in palette
			const paletteNodeCount = await editorPage.paletteNodes.count();
			expect(paletteNodeCount).toBeGreaterThan(0);
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should show ReactFlow controls', async ({ request, page }) => {
		const workflowTitle = generateWorkflowTitle('Controls');
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Controls should be visible
			await expect(editorPage.controls).toBeVisible();
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should select a node when clicked', async ({ request, page }) => {
		const workflowTitle = generateWorkflowTitle('Select Node');
		const workflowName = await createWebhookWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Wait for nodes to render
			await page.waitForTimeout(1000);

			// Get first node and click it
			const nodeIds = await editorPage.getAllNodeIds();
			expect(nodeIds.length).toBeGreaterThan(0);

			await editorPage.selectNode(nodeIds[0]);

			// Node should have selected class
			const selectedNode = editorPage.getNodeById(nodeIds[0]);
			await expect(selectedNode).toHaveClass(/selected/);
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should use zoom controls', async ({ request, page }) => {
		const workflowTitle = generateWorkflowTitle('Zoom Controls');
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Test zoom in
			await editorPage.zoomIn();

			// Test zoom out
			await editorPage.zoomOut();

			// Test fit view
			await editorPage.fitView();

			// Editor should still be visible
			await editorPage.expectEditorVisible();
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should persist node count after page reload', async ({
		request,
		page,
	}) => {
		const workflowTitle = generateWorkflowTitle('Persist Reload');
		const workflowName = await createWebhookLogWorkflow(
			request,
			workflowTitle
		);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Wait for nodes to render
			await page.waitForTimeout(1000);

			const initialNodeCount = await editorPage.getNodeCount();

			// Reload the page
			await page.reload();
			await editorPage.waitForEditorReady();

			// Wait for nodes to render again
			await page.waitForTimeout(1000);

			const reloadedNodeCount = await editorPage.getNodeCount();

			// Node count should be the same
			expect(reloadedNodeCount).toBe(initialNodeCount);
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});
});

/**
 * Workflow Editor - Node Interaction tests.
 * Authentication is handled by the setup project - tests run pre-authenticated.
 */
test.describe('Workflow Editor - Node Interactions', () => {
	test('should drag and drop node from palette to canvas', async ({
		request,
		page,
	}) => {
		const workflowTitle = generateWorkflowTitle('Drag Drop');
		const workflowName = await createTestWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			const initialNodeCount = await editorPage.getNodeCount();

			// Try to drag a Log node to the canvas
			await editorPage.dragNodeToCanvas('Log', 300, 200);

			// Wait for node to be added
			await page.waitForTimeout(500);

			const newNodeCount = await editorPage.getNodeCount();

			// Should have one more node
			expect(newNodeCount).toBe(initialNodeCount + 1);
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});

	test('should delete node with keyboard', async ({ request, page }) => {
		const workflowTitle = generateWorkflowTitle('Delete Node');
		const workflowName = await createWebhookWorkflow(request, workflowTitle);

		try {
			const editorPage = new WorkflowEditorPage(page);
			await editorPage.goto(workflowName);

			// Wait for nodes to render
			await page.waitForTimeout(1000);

			const initialNodeCount = await editorPage.getNodeCount();
			const nodeIds = await editorPage.getAllNodeIds();

			if (nodeIds.length > 0) {
				// Select and delete the first node
				await editorPage.deleteNode(nodeIds[0]);

				// Wait for deletion
				await page.waitForTimeout(500);

				const newNodeCount = await editorPage.getNodeCount();

				// Should have one less node
				expect(newNodeCount).toBe(initialNodeCount - 1);
			}
		} finally {
			await deleteTestWorkflow(request, workflowName);
		}
	});
});
