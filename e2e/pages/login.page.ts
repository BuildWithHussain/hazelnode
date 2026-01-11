import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Frappe login page.
 *
 * Frappe uses specific HTML structure for login:
 * - Email input: input[type="text"] with autocomplete="username"
 * - Password input: input[type="password"]
 * - Submit button: .btn-login or button with "Login" text
 */
export class LoginPage {
	readonly page: Page;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;

	constructor(page: Page) {
		this.page = page;
		// Frappe login page selectors - try multiple options for compatibility
		this.emailInput = page.locator(
			'input#login_email, input[autocomplete="username"], input[name="usr"]'
		);
		this.passwordInput = page.locator(
			'input#login_password, input[type="password"]'
		);
		this.submitButton = page.locator(
			'.btn-login, .btn-login-area button, button:has-text("Login")'
		);
		this.errorMessage = page.locator(
			'.alert-danger, .msgprint, .login-content .alert'
		);
	}

	/**
	 * Navigate to the login page.
	 */
	async goto(): Promise<void> {
		await this.page.goto('/login');
		await this.page.waitForLoadState('networkidle');
	}

	/**
	 * Fill in the login form with credentials.
	 */
	async fillCredentials(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
	}

	/**
	 * Submit the login form.
	 */
	async submit(): Promise<void> {
		await this.submitButton.click();
	}

	/**
	 * Perform a complete login.
	 */
	async login(
		email: string = 'Administrator',
		password: string = 'admin'
	): Promise<void> {
		await this.goto();
		await this.fillCredentials(email, password);
		await this.submit();
		await this.page.waitForURL(/\/(app|desk|hazelnode)/, { timeout: 30000 });
	}

	/**
	 * Assert that login failed with an error.
	 */
	async expectLoginError(): Promise<void> {
		await expect(this.errorMessage).toBeVisible();
	}

	/**
	 * Assert that we're on the login page.
	 */
	async expectToBeOnLoginPage(): Promise<void> {
		await expect(this.page).toHaveURL(/.*login.*/);
	}
}
