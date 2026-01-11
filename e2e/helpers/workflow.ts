import { APIRequestContext } from '@playwright/test';
import { createDoc, deleteDoc, getDoc, docExists } from './frappe';

/**
 * Hazel Workflow document interface.
 */
export interface HazelWorkflow {
	name: string;
	title: string;
	description?: string;
	is_active?: boolean;
	nodes?: HazelNode[];
	connections?: HazelConnection[];
}

/**
 * Hazel Node interface.
 */
export interface HazelNode {
	node_id: string;
	node_type: string;
	position_x: number;
	position_y: number;
	params?: Record<string, unknown>;
}

/**
 * Hazel Connection interface.
 */
export interface HazelConnection {
	source_node: string;
	source_handle?: string;
	target_node: string;
	target_handle?: string;
}

/**
 * Create a test workflow via API.
 * Returns the workflow name (docname).
 */
export async function createTestWorkflow(
	request: APIRequestContext,
	title: string,
	options: {
		description?: string;
		nodes?: HazelNode[];
		connections?: HazelConnection[];
	} = {}
): Promise<string> {
	const doc = await createDoc<HazelWorkflow>(request, 'Hazel Workflow', {
		title,
		description: options.description || `Test workflow: ${title}`,
		nodes: options.nodes || [],
		connections: options.connections || [],
	});

	return doc.name;
}

/**
 * Delete a test workflow via API.
 */
export async function deleteTestWorkflow(
	request: APIRequestContext,
	name: string
): Promise<void> {
	if (await docExists(request, 'Hazel Workflow', name)) {
		await deleteDoc(request, 'Hazel Workflow', name);
	}
}

/**
 * Get a workflow by name.
 */
export async function getWorkflow(
	request: APIRequestContext,
	name: string
): Promise<HazelWorkflow> {
	return getDoc<HazelWorkflow>(request, 'Hazel Workflow', name);
}

/**
 * Create a simple webhook trigger workflow.
 */
export async function createWebhookWorkflow(
	request: APIRequestContext,
	title: string
): Promise<string> {
	return createTestWorkflow(request, title, {
		nodes: [
			{
				node_id: 'node_1_webhook',
				node_type: 'Webhook',
				position_x: 100,
				position_y: 200,
			},
		],
	});
}

/**
 * Create a workflow with webhook trigger and log action.
 */
export async function createWebhookLogWorkflow(
	request: APIRequestContext,
	title: string
): Promise<string> {
	return createTestWorkflow(request, title, {
		nodes: [
			{
				node_id: 'node_1_webhook',
				node_type: 'Webhook',
				position_x: 100,
				position_y: 200,
			},
			{
				node_id: 'node_2_log',
				node_type: 'Log',
				position_x: 350,
				position_y: 200,
				params: {
					message: 'Test log message',
				},
			},
		],
		connections: [
			{
				source_node: 'node_1_webhook',
				target_node: 'node_2_log',
			},
		],
	});
}

/**
 * Generate a unique workflow title for tests.
 */
export function generateWorkflowTitle(prefix: string = 'Test'): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	return `${prefix} Workflow ${timestamp}-${random}`;
}

/**
 * Clean up all test workflows (use with caution).
 */
export async function cleanupTestWorkflows(
	request: APIRequestContext,
	titlePrefix: string = 'Test'
): Promise<void> {
	const { getList } = await import('./frappe');
	const workflows = await getList<HazelWorkflow>(request, 'Hazel Workflow', {
		filters: { title: ['like', `${titlePrefix}%`] },
		fields: ['name'],
	});

	for (const workflow of workflows) {
		await deleteTestWorkflow(request, workflow.name);
	}
}
