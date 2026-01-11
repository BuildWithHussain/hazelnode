import { APIRequestContext } from '@playwright/test';
import { createDoc, deleteDoc, getDoc, docExists } from './frappe';

/**
 * Hazel Workflow document interface.
 * Based on hazelnode/doctype/hazel_workflow/hazel_workflow.json
 */
export interface HazelWorkflow {
	name: string;
	title: string;
	description?: string;
	enabled?: number; // Frappe Check field: 0 or 1
	trigger_type?: string; // Link to Hazel Node Type
	trigger_config?: string; // JSON
	nodes?: HazelNode[];
	connections?: HazelConnection[];
}

/**
 * Hazel Node interface.
 * Based on hazelnode/doctype/hazel_node/hazel_node.json
 */
export interface HazelNode {
	node_id: string;
	type: string; // Link to Hazel Node Type
	position_x: number;
	position_y: number;
	parameters?: string; // JSON string
}

/**
 * Hazel Connection interface.
 * Based on hazelnode/doctype/hazel_node_connection/hazel_node_connection.json
 */
export interface HazelConnection {
	source_node_id: string;
	source_handle?: string;
	target_node_id: string;
	target_handle?: string;
}

/**
 * Create a test workflow via API.
 * Returns the workflow name (docname).
 *
 * Note: If nodes are provided, trigger_type must also be set
 * per hazel_workflow.py validation.
 */
export async function createTestWorkflow(
	request: APIRequestContext,
	title: string,
	options: {
		description?: string;
		trigger_type?: string;
		trigger_config?: Record<string, unknown>;
		nodes?: HazelNode[];
		connections?: HazelConnection[];
	} = {}
): Promise<string> {
	const doc = await createDoc<HazelWorkflow>(request, 'Hazel Workflow', {
		title,
		description: options.description || `Test workflow: ${title}`,
		trigger_type: options.trigger_type,
		trigger_config: options.trigger_config
			? JSON.stringify(options.trigger_config)
			: undefined,
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
 * Create a workflow with Schedule Event trigger (no action nodes).
 * This is the simplest valid workflow for testing.
 */
export async function createScheduleWorkflow(
	request: APIRequestContext,
	title: string
): Promise<string> {
	return createTestWorkflow(request, title, {
		trigger_type: 'Schedule Event',
		trigger_config: { cron: '0 0 * * *' },
	});
}

/**
 * Create a workflow with Schedule Event trigger and Log action.
 */
export async function createScheduleLogWorkflow(
	request: APIRequestContext,
	title: string
): Promise<string> {
	return createTestWorkflow(request, title, {
		trigger_type: 'Schedule Event',
		trigger_config: { cron: '0 0 * * *' },
		nodes: [
			{
				node_id: 'node_1_log',
				type: 'Log',
				position_x: 350,
				position_y: 200,
				parameters: JSON.stringify({ message: 'Test log message' }),
			},
		],
		connections: [
			{
				source_node_id: 'trigger',
				source_handle: 'default',
				target_node_id: 'node_1_log',
				target_handle: 'default',
			},
		],
	});
}

/**
 * Create a workflow with Document Event trigger.
 */
export async function createDocumentEventWorkflow(
	request: APIRequestContext,
	title: string
): Promise<string> {
	return createTestWorkflow(request, title, {
		trigger_type: 'Document Event',
		trigger_config: { doctype: 'User', event: 'on_update' },
	});
}

// Legacy aliases for backward compatibility
export const createWebhookWorkflow = createScheduleWorkflow;
export const createWebhookLogWorkflow = createScheduleLogWorkflow;

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
