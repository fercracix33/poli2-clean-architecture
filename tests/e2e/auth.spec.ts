import { test, expect } from '@playwright/test';

test.describe('User Profile Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.goto('/');
  });

  test.describe('Profile Creation Flow', () => {
    test('should create user profile through UI form', async ({ page }) => {
      // Navigate to profile creation
      await page.goto('/auth/create-profile');
      
      // Verify form elements exist
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
      
      // Fill form with valid data
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="name-input"]', 'Test User');
      
      // Submit form
      await page.click('[data-testid="submit-button"]');
      
      // Verify success state
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Profile created successfully');
      
      // Verify redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test('should show validation errors in form', async ({ page }) => {
      await page.goto('/auth/create-profile');
      
      // Submit empty form
      await page.click('[data-testid="submit-button"]');
      
      // Verify validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
      
      // Fill invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="submit-button"]');
      
      // Verify email format error
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
    });

    test('should display loading states during operations', async ({ page }) => {
      await page.goto('/auth/create-profile');
      
      // Fill form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="name-input"]', 'Test User');
      
      // Submit and verify loading state
      await page.click('[data-testid="submit-button"]');
      
      // Verify loading indicators
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
      await expect(page.locator('[data-testid="submit-button"]')).toContainText('Creating...');
    });
  });

  test.describe('Profile Update Flow', () => {
    test('should update user profile through settings page', async ({ page }) => {
      // Navigate to settings
      await page.goto('/settings/profile');
      
      // Verify form is pre-populated
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Current User');
      await expect(page.locator('[data-testid="email-input"]')).toHaveValue('current@example.com');
      
      // Update name
      await page.fill('[data-testid="name-input"]', 'Updated Name');
      
      // Upload avatar
      await page.setInputFiles('[data-testid="avatar-input"]', 'tests/fixtures/avatar.jpg');
      
      // Submit update
      await page.click('[data-testid="update-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Profile updated successfully');
      
      // Verify updated data is displayed
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Updated Name');
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible();
    });

    test('should handle update errors gracefully', async ({ page }) => {
      await page.goto('/settings/profile');
      
      // Clear required field
      await page.fill('[data-testid="name-input"]', '');
      
      // Submit update
      await page.click('[data-testid="update-button"]');
      
      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Name cannot be empty');
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible via keyboard navigation', async ({ page }) => {
      await page.goto('/auth/create-profile');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="name-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="submit-button"]')).toBeFocused();
      
      // Submit with Enter
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.keyboard.press('Enter');
      
      // Verify form submission
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/auth/create-profile');
      
      // Verify ARIA attributes
      await expect(page.locator('[data-testid="profile-form"]')).toHaveAttribute('role', 'form');
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label', 'Email address');
      await expect(page.locator('[data-testid="name-input"]')).toHaveAttribute('aria-label', 'Full name');
      await expect(page.locator('[data-testid="submit-button"]')).toHaveAttribute('aria-label', 'Create profile');
      
      // Verify error announcements
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="email-error"]')).toHaveAttribute('role', 'alert');
      await expect(page.locator('[data-testid="name-error"]')).toHaveAttribute('role', 'alert');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/create-profile');
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-form"]')).toHaveCSS('max-width', '100%');
      
      // Verify form elements are properly sized
      await expect(page.locator('[data-testid="email-input"]')).toHaveCSS('width', '100%');
      await expect(page.locator('[data-testid="name-input"]')).toHaveCSS('width', '100%');
      
      // Verify touch-friendly button size
      const submitButton = page.locator('[data-testid="submit-button"]');
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/settings/profile');
      
      // Verify tablet layout
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-form"]')).toHaveCSS('max-width', '600px');
      
      // Verify form is centered
      const form = page.locator('[data-testid="profile-form"]');
      const formBox = await form.boundingBox();
      expect(formBox?.x).toBeGreaterThan(80); // Should have margin on sides
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/auth/create-profile');
      
      // Verify desktop layout
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-form"]')).toHaveCSS('max-width', '500px');
      
      // Verify form is centered with proper spacing
      const form = page.locator('[data-testid="profile-form"]');
      const formBox = await form.boundingBox();
      expect(formBox?.x).toBeGreaterThan(700); // Should be centered
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/auth/profile', route => route.abort());
      
      await page.goto('/auth/create-profile');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.click('[data-testid="submit-button"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error. Please try again.');
      
      // Verify retry functionality
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/api/auth/profile', route => 
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) })
      );
      
      await page.goto('/auth/create-profile');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.click('[data-testid="submit-button"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Something went wrong. Please try again later.');
    });
  });
});