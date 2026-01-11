import { APIRequestContext } from '@playwright/test';

/**
 * Frappe API response wrapper.
 */
export interface FrappeResponse<T = unknown> {
	message?: T;
	exc?: string;
	exc_type?: string;
	_server_messages?: string;
}

/**
 * Create a new document via Frappe REST API.
 */
export async function createDoc<T = Record<string, unknown>>(
	request: APIRequestContext,
	doctype: string,
	doc: Record<string, unknown>
): Promise<T> {
	const response = await request.post(`/api/resource/${doctype}`, {
		data: doc,
	});

	if (!response.ok()) {
		const error = await response.text();
		throw new Error(`Failed to create ${doctype}: ${error}`);
	}

	const result = await response.json();
	return result.data as T;
}

/**
 * Get a document by name via Frappe REST API.
 */
export async function getDoc<T = Record<string, unknown>>(
	request: APIRequestContext,
	doctype: string,
	name: string
): Promise<T> {
	const response = await request.get(
		`/api/resource/${doctype}/${encodeURIComponent(name)}`
	);

	if (!response.ok()) {
		const error = await response.text();
		throw new Error(`Failed to get ${doctype}/${name}: ${error}`);
	}

	const result = await response.json();
	return result.data as T;
}

/**
 * Update a document via Frappe REST API.
 */
export async function updateDoc<T = Record<string, unknown>>(
	request: APIRequestContext,
	doctype: string,
	name: string,
	updates: Record<string, unknown>
): Promise<T> {
	const response = await request.put(
		`/api/resource/${doctype}/${encodeURIComponent(name)}`,
		{ data: updates }
	);

	if (!response.ok()) {
		const error = await response.text();
		throw new Error(`Failed to update ${doctype}/${name}: ${error}`);
	}

	const result = await response.json();
	return result.data as T;
}

/**
 * Delete a document via Frappe REST API.
 */
export async function deleteDoc(
	request: APIRequestContext,
	doctype: string,
	name: string
): Promise<void> {
	const response = await request.delete(
		`/api/resource/${doctype}/${encodeURIComponent(name)}`
	);

	if (!response.ok()) {
		const error = await response.text();
		throw new Error(`Failed to delete ${doctype}/${name}: ${error}`);
	}
}

/**
 * Call a Frappe whitelisted method.
 */
export async function callMethod<T = unknown>(
	request: APIRequestContext,
	method: string,
	args: Record<string, unknown> = {}
): Promise<T> {
	const response = await request.post(`/api/method/${method}`, {
		data: args,
	});

	if (!response.ok()) {
		const error = await response.text();
		throw new Error(`Failed to call ${method}: ${error}`);
	}

	const result: FrappeResponse<T> = await response.json();
	return result.message as T;
}

/**
 * Get a list of documents via Frappe REST API.
 */
export async function getList<T = Record<string, unknown>>(
	request: APIRequestContext,
	doctype: string,
	options: {
		fields?: string[];
		filters?: Record<string, unknown>;
		limit?: number;
		orderBy?: string;
	} = {}
): Promise<T[]> {
	const params = new URLSearchParams();

	if (options.fields) {
		params.set('fields', JSON.stringify(options.fields));
	}
	if (options.filters) {
		params.set('filters', JSON.stringify(options.filters));
	}
	if (options.limit) {
		params.set('limit_page_length', options.limit.toString());
	}
	if (options.orderBy) {
		params.set('order_by', options.orderBy);
	}

	const response = await request.get(
		`/api/resource/${doctype}?${params.toString()}`
	);

	if (!response.ok()) {
		const error = await response.text();
		throw new Error(`Failed to get list of ${doctype}: ${error}`);
	}

	const result = await response.json();
	return result.data as T[];
}

/**
 * Check if a document exists.
 */
export async function docExists(
	request: APIRequestContext,
	doctype: string,
	name: string
): Promise<boolean> {
	try {
		await getDoc(request, doctype, name);
		return true;
	} catch {
		return false;
	}
}
