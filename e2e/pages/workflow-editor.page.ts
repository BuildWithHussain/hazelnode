import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Hazelnode workflow editor page.
 */
export class WorkflowEditorPage {
	readonly page: Page;

	// Main layout elements
	readonly canvas: Locator;
	readonly nodePalette: Locator;
	readonly configPanel: Locator;

	// ReactFlow elements
	readonly reactFlowContainer: Locator;
	readonly nodes: Locator;
	readonly edges: Locator;
	readonly controls: Locator;

	// Palette elements
	readonly paletteNodes: Locator;
	readonly actionNodes: Locator;
	readonly logicNodes: Locator;

	// Config panel elements
	readonly configPanelTitle: Locator;
	readonly saveButton: Locator;

	constructor(page: Page) {
		this.page = page;

		// Main layout
		this.canvas = page.locator('.react-flow');
		this.nodePalette = page.locator('[class*="scroll-area"], .p-3:has(h3)');
		this.configPanel = page.locator(
			'[data-testid="config-panel"], .config-panel'
		);

		// ReactFlow
		this.reactFlowContainer = page.locator('.react-flow__renderer');
		this.nodes = page.locator('.react-flow__node');
		this.edges = page.locator('.react-flow__edge');
		this.controls = page.locator('.react-flow__controls');

		// Palette
		this.paletteNodes = page.locator('[draggable="true"]');
		this.actionNodes = page.locator(
			'h4:has-text("Actions") + div [draggable="true"]'
		);
		this.logicNodes = page.locator(
			'h4:has-text("Logic") + div [draggable="true"]'
		);

		// Config panel
		this.configPanelTitle = page.locator('[data-testid="config-panel-title"]');
		this.saveButton = page.locator('button:has-text("Save")');
	}

	/**
	 * Navigate to a workflow editor by ID.
	 */
	async goto(workflowId: string): Promise<void> {
		await this.page.goto(`/hazelnode/workflow/${workflowId}`);
		await this.waitForEditorReady();
	}

	/**
	 * Wait for the editor to be ready.
	 */
	async waitForEditorReady(): Promise<void> {
		await this.page.waitForLoadState('networkidle');
		await this.canvas.waitFor({ state: 'visible', timeout: 30000 });
	}

	/**
	 * Get the count of nodes on the canvas.
	 */
	async getNodeCount(): Promise<number> {
		return this.nodes.count();
	}

	/**
	 * Get the count of edges (connections) on the canvas.
	 */
	async getEdgeCount(): Promise<number> {
		return this.edges.count();
	}

	/**
	 * Get a specific node by its data-id attribute.
	 */
	getNodeById(nodeId: string): Locator {
		return this.page.locator(`.react-flow__node[data-id="${nodeId}"]`);
	}

	/**
	 * Get a draggable node from the palette by name.
	 */
	getPaletteNode(nodeName: string): Locator {
		return this.page.locator(`[draggable="true"]:has-text("${nodeName}")`);
	}

	/**
	 * Drag a node from the palette to the canvas.
	 */
	async dragNodeToCanvas(
		nodeName: string,
		targetX: number,
		targetY: number
	): Promise<void> {
		const paletteNode = this.getPaletteNode(nodeName);
		const canvasBounds = await this.canvas.boundingBox();

		if (!canvasBounds) {
			throw new Error('Canvas not found');
		}

		// Calculate target position relative to viewport
		const targetPosition = {
			x: canvasBounds.x + targetX,
			y: canvasBounds.y + targetY,
		};

		await paletteNode.dragTo(this.canvas, {
			targetPosition: { x: targetX, y: targetY },
		});
	}

	/**
	 * Click on a node to select it.
	 */
	async selectNode(nodeId: string): Promise<void> {
		const node = this.getNodeById(nodeId);
		await node.click();
	}

	/**
	 * Double-click on a node to open its config.
	 */
	async openNodeConfig(nodeId: string): Promise<void> {
		const node = this.getNodeById(nodeId);
		await node.dblclick();
	}

	/**
	 * Connect two nodes by dragging from source handle to target handle.
	 */
	async connectNodes(
		sourceNodeId: string,
		targetNodeId: string,
		sourceHandle: string = 'source',
		targetHandle: string = 'target'
	): Promise<void> {
		const sourceConnector = this.page.locator(
			`.react-flow__node[data-id="${sourceNodeId}"] .react-flow__handle[data-handleid="${sourceHandle}"]`
		);
		const targetConnector = this.page.locator(
			`.react-flow__node[data-id="${targetNodeId}"] .react-flow__handle[data-handleid="${targetHandle}"]`
		);

		await sourceConnector.dragTo(targetConnector);
	}

	/**
	 * Delete the currently selected node.
	 */
	async deleteSelectedNode(): Promise<void> {
		await this.page.keyboard.press('Delete');
	}

	/**
	 * Delete a node by its ID.
	 */
	async deleteNode(nodeId: string): Promise<void> {
		await this.selectNode(nodeId);
		await this.deleteSelectedNode();
	}

	/**
	 * Save the workflow.
	 */
	async save(): Promise<void> {
		await this.saveButton.click();
		await this.page.waitForResponse(
			(resp) =>
				resp.url().includes('/api/resource/Hazel%20Workflow') &&
				resp.request().method() === 'PUT' &&
				resp.status() === 200
		);
	}

	/**
	 * Zoom in on the canvas.
	 */
	async zoomIn(): Promise<void> {
		const zoomInButton = this.controls.locator('button[title="zoom in"]');
		await zoomInButton.click();
	}

	/**
	 * Zoom out on the canvas.
	 */
	async zoomOut(): Promise<void> {
		const zoomOutButton = this.controls.locator('button[title="zoom out"]');
		await zoomOutButton.click();
	}

	/**
	 * Fit the view to show all nodes.
	 */
	async fitView(): Promise<void> {
		const fitButton = this.controls.locator('button[title="fit view"]');
		await fitButton.click();
	}

	/**
	 * Assert that the editor is displayed.
	 */
	async expectEditorVisible(): Promise<void> {
		await expect(this.canvas).toBeVisible();
	}

	/**
	 * Assert a specific number of nodes on canvas.
	 */
	async expectNodeCount(count: number): Promise<void> {
		await expect(this.nodes).toHaveCount(count);
	}

	/**
	 * Assert a specific number of edges on canvas.
	 */
	async expectEdgeCount(count: number): Promise<void> {
		await expect(this.edges).toHaveCount(count);
	}

	/**
	 * Assert that a node with given ID exists.
	 */
	async expectNodeExists(nodeId: string): Promise<void> {
		await expect(this.getNodeById(nodeId)).toBeVisible();
	}

	/**
	 * Get all node IDs currently on the canvas.
	 */
	async getAllNodeIds(): Promise<string[]> {
		const nodes = await this.nodes.all();
		const ids: string[] = [];
		for (const node of nodes) {
			const id = await node.getAttribute('data-id');
			if (id) ids.push(id);
		}
		return ids;
	}
}
