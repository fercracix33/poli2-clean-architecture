import { Page } from '@playwright/test';

/**
 * Organization E2E Test Helpers
 *
 * These helpers provide reusable functions for setting up test data,
 * authenticating users, and cleaning up after tests.
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
  id?: string;
}

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
}

/**
 * Authenticate a user by performing the login flow
 *
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function authenticateUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // Clear any existing cookies
  await page.context().clearCookies();

  // Navigate to login page
  await page.goto('/auth/login');

  // Fill login form
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);

  // Submit form
  await page.click('[data-testid="submit-button"]');

  // Wait for redirect to dashboard or home
  await page.waitForURL(/\/(dashboard|home|org)/, { timeout: 10000 });
}

/**
 * Register a new user through the UI
 *
 * @param page - Playwright page object
 * @param user - User data
 * @returns The registered user data
 */
export async function registerUser(
  page: Page,
  user: TestUser
): Promise<TestUser> {
  await page.goto('/auth/register');

  // Fill registration form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.fill('[data-testid="confirm-password-input"]', user.password);

  // Submit form
  await page.click('[data-testid="submit-button"]');

  // Wait for profile creation page
  await page.waitForURL('/auth/create-profile', { timeout: 10000 });

  // Fill profile form
  await page.fill('[data-testid="name-input"]', user.name);

  // Submit profile
  await page.click('[data-testid="submit-button"]');

  // Wait for redirect
  await page.waitForURL(/\/(dashboard|home|org)/, { timeout: 10000 });

  return user;
}

/**
 * Create a test organization through the UI
 *
 * @param page - Playwright page object
 * @param data - Organization data
 * @returns The created organization with ID and invite code
 */
export async function setupTestOrganization(
  page: Page,
  data: { name: string; slug: string; description?: string }
): Promise<TestOrganization> {
  // Navigate to create organization page
  await page.goto('/org/create');

  // Fill organization form
  await page.fill('[data-testid="organization-name-input"]', data.name);
  await page.fill('[data-testid="organization-slug-input"]', data.slug);

  if (data.description) {
    await page.fill('[data-testid="organization-description-input"]', data.description);
  }

  // Submit form
  await page.click('[data-testid="submit-button"]');

  // Wait for redirect to organization dashboard
  await page.waitForURL(`/org/${data.slug}`, { timeout: 10000 });

  // Extract organization ID from the page (might be in a data attribute or API response)
  // For now, we'll construct the organization object with the data we have
  // The ID will need to be extracted from the page or API response in the actual implementation
  const organizationId = await page.evaluate(() => {
    // Try to get org ID from meta tag or data attribute
    const metaTag = document.querySelector('meta[name="organization-id"]');
    if (metaTag) {
      return metaTag.getAttribute('content') || '';
    }
    // Fallback: try to get from data attribute on body or main element
    const orgElement = document.querySelector('[data-organization-id]');
    if (orgElement) {
      return orgElement.getAttribute('data-organization-id') || '';
    }
    return '';
  });

  // Navigate to settings to get invite code
  await page.goto(`/org/${data.slug}/settings`);
  await page.waitForLoadState('networkidle');

  // Get invite code from the page
  const inviteCode = await page.locator('[data-testid="invite-code"]').textContent() || '';

  return {
    id: organizationId || `test-org-${Date.now()}`, // Fallback to timestamp-based ID
    name: data.name,
    slug: data.slug,
    inviteCode: inviteCode.trim(),
  };
}

/**
 * Create a test organization using API (faster than UI)
 *
 * @param page - Playwright page object (for API context)
 * @param data - Organization data
 * @param userId - User ID who will be the owner
 * @returns The created organization
 */
export async function createOrganizationViaAPI(
  page: Page,
  data: { name: string; slug: string; description?: string },
  userId?: string
): Promise<TestOrganization> {
  // Make API request to create organization
  const response = await page.request.post('/api/organizations', {
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create organization: ${response.status()} ${response.statusText()}`);
  }

  const organization = await response.json();

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    inviteCode: organization.invite_code,
  };
}

/**
 * Join an organization using an invite code
 *
 * @param page - Playwright page object
 * @param slug - Organization slug
 * @param inviteCode - 8-character invite code
 */
export async function joinOrganization(
  page: Page,
  slug: string,
  inviteCode: string
): Promise<void> {
  // Navigate to join page
  await page.goto('/org/join');

  // Fill join form
  await page.fill('[data-testid="organization-slug-input"]', slug);
  await page.fill('[data-testid="invite-code-input"]', inviteCode);

  // Submit form
  await page.click('[data-testid="submit-button"]');

  // Wait for redirect to organization dashboard
  await page.waitForURL(`/org/${slug}`, { timeout: 10000 });
}

/**
 * Join an organization using API (faster than UI)
 *
 * @param page - Playwright page object (for API context)
 * @param slug - Organization slug
 * @param inviteCode - 8-character invite code
 */
export async function joinOrganizationViaAPI(
  page: Page,
  slug: string,
  inviteCode: string
): Promise<void> {
  const response = await page.request.post('/api/organizations/join', {
    data: {
      slug,
      inviteCode,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to join organization: ${response.status()} ${response.statusText()}`);
  }
}

/**
 * Invite a user to an organization
 *
 * @param page - Playwright page object
 * @param organizationSlug - Organization slug
 * @param email - Email of user to invite
 */
export async function inviteUserToOrganization(
  page: Page,
  organizationSlug: string,
  email: string
): Promise<void> {
  // Navigate to members page
  await page.goto(`/org/${organizationSlug}/members`);

  // Open invite dialog
  await page.click('[data-testid="invite-members-button"]');

  // Wait for dialog to open
  await page.waitForSelector('[data-testid="invite-dialog"]', { state: 'visible' });

  // Show invite code or copy it
  const inviteCode = await page.locator('[data-testid="invite-code"]').textContent();

  // Note: Actual email invitation would require email setup
  // For E2E tests, we'll use the invite code approach
  console.log(`Invite code for ${email}: ${inviteCode}`);
}

/**
 * Change a user's role in an organization
 *
 * @param page - Playwright page object
 * @param organizationSlug - Organization slug
 * @param memberEmail - Email of the member
 * @param newRole - New role (admin, member, viewer)
 */
export async function changeUserRole(
  page: Page,
  organizationSlug: string,
  memberEmail: string,
  newRole: 'admin' | 'member' | 'viewer'
): Promise<void> {
  // Navigate to members page
  await page.goto(`/org/${organizationSlug}/members`);

  // Find the member in the list
  const memberRow = page.locator(`[data-testid="member-row"]:has-text("${memberEmail}")`);

  // Open actions menu
  await memberRow.locator('[data-testid="member-actions-button"]').click();

  // Click change role option
  await page.click('[data-testid="change-role-option"]');

  // Select new role
  await page.click(`[data-testid="role-option-${newRole}"]`);

  // Confirm change
  await page.click('[data-testid="confirm-change-button"]');

  // Wait for success message or role badge update
  await page.waitForSelector(`[data-testid="member-row"]:has-text("${memberEmail}") [data-testid="role-badge"]:has-text("${newRole}")`, {
    timeout: 5000
  });
}

/**
 * Remove a member from an organization
 *
 * @param page - Playwright page object
 * @param organizationSlug - Organization slug
 * @param memberEmail - Email of the member to remove
 */
export async function removeMember(
  page: Page,
  organizationSlug: string,
  memberEmail: string
): Promise<void> {
  // Navigate to members page
  await page.goto(`/org/${organizationSlug}/members`);

  // Find the member in the list
  const memberRow = page.locator(`[data-testid="member-row"]:has-text("${memberEmail}")`);

  // Open actions menu
  await memberRow.locator('[data-testid="member-actions-button"]').click();

  // Click remove option
  await page.click('[data-testid="remove-member-option"]');

  // Confirm removal in dialog
  await page.click('[data-testid="confirm-remove-button"]');

  // Wait for member to be removed from list
  await page.waitForSelector(`[data-testid="member-row"]:has-text("${memberEmail}")`, {
    state: 'detached',
    timeout: 5000
  });
}

/**
 * Clean up test data after tests
 *
 * @param page - Playwright page object (for API context)
 * @param organizationSlug - Organization slug to delete
 */
export async function cleanupTestData(
  page: Page,
  organizationSlug: string
): Promise<void> {
  try {
    // Delete organization via API
    const response = await page.request.delete(`/api/organizations/${organizationSlug}/delete`);

    if (!response.ok() && response.status() !== 404) {
      console.warn(`Failed to cleanup organization ${organizationSlug}: ${response.status()}`);
    }
  } catch (error) {
    // Ignore cleanup errors in tests
    console.warn(`Error during cleanup of ${organizationSlug}:`, error);
  }
}

/**
 * Generate unique test email
 *
 * @param prefix - Email prefix
 * @returns Unique email address
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Generate unique organization slug
 *
 * @param prefix - Slug prefix
 * @returns Unique organization slug
 */
export function generateTestSlug(prefix: string = 'test-org'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Wait for API response with specific status
 *
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to match
 * @param status - Expected status code
 * @returns Promise that resolves when response is received
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  status: number = 200
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      const matches = typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);
      return matches && response.status() === status;
    },
    { timeout: 10000 }
  );
}
