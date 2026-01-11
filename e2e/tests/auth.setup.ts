import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

/**
 * Authentication setup - runs once before all tests.
 *
 * This follows Playwright's recommended "setup project" pattern:
 * - Authenticates via API (faster than UI login)
 * - Saves browser state (cookies) to file
 * - Other tests reuse this state via storageState config
 *
 * @see https://playwright.dev/docs/auth
 */
setup('authenticate', async ({ request, page }) => {
	// Login via Frappe API
	const loginResponse = await request.post('/api/method/login', {
		form: {
			usr: process.env.FRAPPE_USER || 'Administrator',
			pwd: process.env.FRAPPE_PASSWORD || 'admin',
		},
	});

	expect(loginResponse.ok()).toBeTruthy();

	// Verify login succeeded by checking current user
	const userResponse = await request.get(
		'/api/method/frappe.auth.get_logged_user'
	);
	expect(userResponse.ok()).toBeTruthy();

	const userData = await userResponse.json();
	expect(userData.message).not.toBe('Guest');

	console.log(`✅ Authenticated as: ${userData.message}`);

	// Navigate to app to ensure cookies are set in browser context
	await page.goto('/app');
	await page.waitForLoadState('networkidle');

	// Save authentication state
	await page.context().storageState({ path: authFile });
	console.log(`💾 Saved auth state to ${authFile}`);
});
