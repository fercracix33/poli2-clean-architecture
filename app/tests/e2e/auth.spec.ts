import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test.describe('Registration', () => {
    test('should register with email and password only', async ({ page }) => {
      await page.goto('/auth/register');

      // Verify form elements exist - ONLY authentication fields
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();

      // Verify name field does NOT exist in register form
      await expect(page.locator('[data-testid="name-input"]')).not.toBeVisible();

      // Fill form with valid data
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Verify success state
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Should redirect to create-profile
      await expect(page).toHaveURL('/auth/create-profile');
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/register');

      // Fill with invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');

      // Verify email format error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email');
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/auth/register');

      // Fill with weak password
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', '123');
      await page.fill('[data-testid="confirm-password-input"]', '123');
      await page.click('[data-testid="submit-button"]');

      // Verify password strength error
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toContainText('at least 8');
    });

    test('should validate passwords match', async ({ page }) => {
      await page.goto('/auth/register');

      // Fill with non-matching passwords
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPass123');
      await page.click('[data-testid="submit-button"]');

      // Verify passwords match error
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('match');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/auth/register');

      // Submit empty form
      await page.click('[data-testid="submit-button"]');

      // Verify all validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
    });

    test('should display loading states during registration', async ({ page }) => {
      await page.goto('/auth/register');

      // Fill form
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');

      // Submit and verify loading state
      await page.click('[data-testid="submit-button"]');

      // Verify loading indicators
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
    });
  });

  test.describe('Create Profile', () => {
    test('should create profile with name only', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Verify form elements exist - enrichment fields only
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="avatar-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();

      // Verify email field does NOT exist in create-profile form
      await expect(page.locator('[data-testid="email-input"]')).not.toBeVisible();

      // Fill form with name only (no avatar)
      await page.fill('[data-testid="name-input"]', 'John Doe');

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Verify success state
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test('should accept optional avatar upload', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Fill form with name
      await page.fill('[data-testid="name-input"]', 'John Doe');

      // Upload avatar
      await page.setInputFiles('[data-testid="avatar-input"]', 'tests/fixtures/avatar.jpg');

      // Verify avatar preview is shown
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible();

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Verify success and redirect
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page).toHaveURL('/dashboard');
    });

    test('should validate name length', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Fill with too short name
      await page.fill('[data-testid="name-input"]', 'A');
      await page.click('[data-testid="submit-button"]');

      // Verify name validation error
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error"]')).toContainText('at least 2');
    });

    test('should show validation error for empty name', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Submit without name
      await page.click('[data-testid="submit-button"]');

      // Verify validation error
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error"]')).toContainText('required');
    });

    test('should work without avatar (optional field)', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Fill only name, skip avatar
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.click('[data-testid="submit-button"]');

      // Should succeed without avatar
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page).toHaveURL('/dashboard');
    });

    test('should display loading states during profile creation', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Fill form
      await page.fill('[data-testid="name-input"]', 'John Doe');

      // Submit and verify loading state
      await page.click('[data-testid="submit-button"]');

      // Verify loading indicators
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
    });
  });

  test.describe('Complete Flow', () => {
    test('should complete full registration and profile creation', async ({ page }) => {
      // Step 1: Register with minimal info
      await page.goto('/auth/register');
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');

      // Should redirect to create-profile
      await expect(page).toHaveURL('/auth/create-profile');

      // Step 2: Complete profile with enrichment data
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.click('[data-testid="submit-button"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');

      // Verify profile was created and displayed
      await expect(page.locator('[data-testid="user-name"]')).toContainText('John Doe');
    });

    test('should complete full flow with avatar upload', async ({ page }) => {
      // Step 1: Register
      await page.goto('/auth/register');
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');

      // Wait for redirect
      await expect(page).toHaveURL('/auth/create-profile');

      // Step 2: Complete profile with avatar
      await page.fill('[data-testid="name-input"]', 'Jane Smith');
      await page.setInputFiles('[data-testid="avatar-input"]', 'tests/fixtures/avatar.jpg');
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible();
      await page.click('[data-testid="submit-button"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');

      // Verify profile data
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Jane Smith');
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('register form is keyboard accessible', async ({ page }) => {
      await page.goto('/auth/register');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="submit-button"]')).toBeFocused();

      // Fill form using keyboard
      await page.locator('[data-testid="email-input"]').focus();
      await page.keyboard.type('user@example.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('SecurePass123');
      await page.keyboard.press('Tab');
      await page.keyboard.type('SecurePass123');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should redirect after successful submission
      await expect(page).toHaveURL('/auth/create-profile');
    });

    test('create profile form is keyboard accessible', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="name-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="avatar-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="submit-button"]')).toBeFocused();

      // Fill form using keyboard
      await page.locator('[data-testid="name-input"]').focus();
      await page.keyboard.type('John Doe');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip avatar
      await page.keyboard.press('Enter'); // Submit

      // Should redirect after successful submission
      await expect(page).toHaveURL('/dashboard');
    });

    test('register form has proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/auth/register');

      // Verify ARIA attributes
      await expect(page.locator('[data-testid="register-form"]')).toHaveAttribute('role', 'form');
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label', 'Email address');
      await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('aria-label', 'Password');
      await expect(page.locator('[data-testid="confirm-password-input"]')).toHaveAttribute('aria-label', 'Confirm password');
      await expect(page.locator('[data-testid="submit-button"]')).toHaveAttribute('aria-label', 'Register');

      // Verify error announcements
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="email-error"]')).toHaveAttribute('role', 'alert');
      await expect(page.locator('[data-testid="password-error"]')).toHaveAttribute('role', 'alert');
    });

    test('create profile form has proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/auth/create-profile');

      // Verify ARIA attributes
      await expect(page.locator('[data-testid="profile-form"]')).toHaveAttribute('role', 'form');
      await expect(page.locator('[data-testid="name-input"]')).toHaveAttribute('aria-label', 'Full name');
      await expect(page.locator('[data-testid="avatar-input"]')).toHaveAttribute('aria-label', 'Profile picture');
      await expect(page.locator('[data-testid="submit-button"]')).toHaveAttribute('aria-label', 'Create profile');

      // Verify error announcements
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="name-error"]')).toHaveAttribute('role', 'alert');
    });
  });

  test.describe('Responsive Design', () => {
    test('register form works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/register');

      // Verify mobile layout
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();

      // Verify form elements are properly sized
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();

      // Verify touch-friendly button size
      const submitButton = page.locator('[data-testid="submit-button"]');
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    });

    test('create profile form works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/create-profile');

      // Verify mobile layout
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();

      // Verify form elements are properly sized
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="avatar-input"]')).toBeVisible();

      // Verify touch-friendly button size
      const submitButton = page.locator('[data-testid="submit-button"]');
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    });

    test('register form works on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/auth/register');

      // Verify tablet layout
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();

      // Verify form is accessible and usable
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');
      await expect(page).toHaveURL('/auth/create-profile');
    });

    test('register form works on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/auth/register');

      // Verify desktop layout
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();

      // Verify form is accessible and usable
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');
      await expect(page).toHaveURL('/auth/create-profile');
    });
  });

  test.describe('Error Handling', () => {
    test('register should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/auth/v1/signup', route => route.abort());

      await page.goto('/auth/register');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    });

    test('create profile should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/auth/profile', route => route.abort());

      await page.goto('/auth/create-profile');
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.click('[data-testid="submit-button"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    });

    test('register should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/auth/v1/signup', route =>
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) })
      );

      await page.goto('/auth/register');
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Something went wrong');
    });

    test('create profile should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/api/auth/profile', route =>
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) })
      );

      await page.goto('/auth/create-profile');
      await page.fill('[data-testid="name-input"]', 'John Doe');
      await page.click('[data-testid="submit-button"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Something went wrong');
    });

    test('register should handle duplicate email error', async ({ page }) => {
      // Simulate duplicate email error
      await page.route('**/auth/v1/signup', route =>
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'User already registered' })
        })
      );

      await page.goto('/auth/register');
      await page.fill('[data-testid="email-input"]', 'existing@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123');
      await page.click('[data-testid="submit-button"]');

      // Verify specific error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('already registered');
    });
  });
});