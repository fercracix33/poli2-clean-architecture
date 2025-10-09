# Authentication Flow E2E Test Specification

## Overview
This document describes the complete E2E test specification for the refactored authentication flow. These tests define the EXPECTED behavior that must be implemented by the UI/UX Expert.

**Test Status:** ❌ ALL TESTS CURRENTLY FAIL (This is correct - they define what needs to be built)

---

## New Authentication Flow

### Old Flow (REMOVED)
```
Register → name, email, password, confirm password
Create Profile → name, email (REDUNDANT!)
```

### New Flow (IMPLEMENTED IN TESTS)
```
Register → email, password, confirm password (minimal friction)
Create Profile → name, avatar_url (optional) (enrichment/personalization)
```

---

## Test Suite Structure

### 1. Registration Tests (`/auth/register`)

#### Required Form Elements
- ✅ `register-form` - Main form container
- ✅ `email-input` - Email address field
- ✅ `password-input` - Password field
- ✅ `confirm-password-input` - Confirm password field
- ✅ `submit-button` - Form submission button
- ❌ `name-input` - MUST NOT exist (moved to create-profile)

#### Required Error Elements
- `email-error` - Email validation error message
- `password-error` - Password validation error message
- `confirm-password-error` - Confirm password validation error message

#### Required State Elements
- `success-message` - Success feedback
- `error-message` - General error feedback
- `loading-spinner` - Loading indicator

#### Validation Rules
1. **Email Format:**
   - Must be valid email format
   - Shows error: "Invalid email"

2. **Password Strength:**
   - Minimum 8 characters
   - Shows error: "at least 8"

3. **Passwords Match:**
   - Password and confirm password must match
   - Shows error: "match"

4. **Required Fields:**
   - All fields required
   - Shows appropriate error for empty fields

#### Success Behavior
- After successful registration → redirect to `/auth/create-profile`
- Show success message before redirect

#### Loading States
- Button disabled during submission
- Loading spinner visible during submission

---

### 2. Create Profile Tests (`/auth/create-profile`)

#### Required Form Elements
- ✅ `profile-form` - Main form container
- ✅ `name-input` - Full name field
- ✅ `avatar-input` - Avatar upload field (file input)
- ✅ `submit-button` - Form submission button
- ❌ `email-input` - MUST NOT exist (already captured in register)

#### Required Display Elements
- `avatar-preview` - Shows preview after file selected
- `name-error` - Name validation error message
- `success-message` - Success feedback
- `error-message` - General error feedback
- `loading-spinner` - Loading indicator

#### Validation Rules
1. **Name Length:**
   - Minimum 2 characters
   - Shows error: "at least 2"

2. **Name Required:**
   - Name is mandatory
   - Shows error: "required"

3. **Avatar Optional:**
   - Avatar upload is OPTIONAL
   - Can submit with just name
   - Should show preview when file selected

#### Success Behavior
- After successful profile creation → redirect to `/dashboard`
- Show success message before redirect
- Display user name in dashboard (`user-name` element)
- Display user avatar if uploaded (`user-avatar` element)

#### Loading States
- Button disabled during submission
- Loading spinner visible during submission

---

### 3. Complete Flow Tests

#### Full Flow Without Avatar
```typescript
1. Register at /auth/register
   - Enter: email, password, confirm password
   - Submit → redirects to /auth/create-profile

2. Create Profile at /auth/create-profile
   - Enter: name only (skip avatar)
   - Submit → redirects to /dashboard

3. Verify Dashboard
   - User name displayed
```

#### Full Flow With Avatar
```typescript
1. Register at /auth/register
   - Enter: email, password, confirm password
   - Submit → redirects to /auth/create-profile

2. Create Profile at /auth/create-profile
   - Enter: name
   - Upload: avatar file
   - See: avatar preview
   - Submit → redirects to /dashboard

3. Verify Dashboard
   - User name displayed
   - User avatar displayed
```

---

### 4. Accessibility Requirements

#### Keyboard Navigation
**Register Form:**
- Tab order: email → password → confirm password → submit button
- Can complete entire form using keyboard
- Enter key submits form

**Create Profile Form:**
- Tab order: name → avatar → submit button
- Can complete entire form using keyboard
- Enter key submits form

#### ARIA Attributes
**Register Form:**
- `register-form` has `role="form"`
- `email-input` has `aria-label="Email address"`
- `password-input` has `aria-label="Password"`
- `confirm-password-input` has `aria-label="Confirm password"`
- `submit-button` has `aria-label="Register"`
- Error messages have `role="alert"`

**Create Profile Form:**
- `profile-form` has `role="form"`
- `name-input` has `aria-label="Full name"`
- `avatar-input` has `aria-label="Profile picture"`
- `submit-button` has `aria-label="Create profile"`
- Error messages have `role="alert"`

---

### 5. Responsive Design Requirements

#### Mobile (375px width)
- All form elements visible and accessible
- Submit button minimum height: 44px (touch-friendly)
- Forms stack vertically
- Full-width inputs

#### Tablet (768px width)
- Forms centered with appropriate margins
- All functionality works correctly
- Comfortable touch targets

#### Desktop (1920px width)
- Forms centered with max-width constraint
- Optimal reading width
- Proper spacing and layout

---

### 6. Error Handling Requirements

#### Network Errors
**Register:**
- Route failure: `**/auth/v1/signup`
- Shows: "Network error"

**Create Profile:**
- Route failure: `**/api/auth/profile`
- Shows: "Network error"

#### Server Errors (500)
**Register:**
- Server error response
- Shows: "Something went wrong"

**Create Profile:**
- Server error response
- Shows: "Something went wrong"

#### Business Logic Errors
**Register - Duplicate Email:**
- Status: 400
- Error: "User already registered"
- Shows: "already registered"

---

## Required data-testid Attributes Summary

### Register Form
- `register-form`
- `email-input`
- `password-input`
- `confirm-password-input`
- `submit-button`
- `email-error`
- `password-error`
- `confirm-password-error`
- `success-message`
- `error-message`
- `loading-spinner`

### Create Profile Form
- `profile-form`
- `name-input`
- `avatar-input`
- `avatar-preview`
- `submit-button`
- `name-error`
- `success-message`
- `error-message`
- `loading-spinner`

### Dashboard Elements
- `user-name`
- `user-avatar`

---

## Implementation Checklist for UI/UX Expert

### Register Page (`/auth/register`)
- [ ] Create register form with ONLY: email, password, confirm password
- [ ] Remove name field from register (it's now in create-profile)
- [ ] Implement email format validation
- [ ] Implement password strength validation (min 8 chars)
- [ ] Implement password match validation
- [ ] Show loading spinner during submission
- [ ] Disable button during submission
- [ ] Handle success → redirect to `/auth/create-profile`
- [ ] Handle errors (network, server, duplicate email)
- [ ] Add all required data-testid attributes
- [ ] Add all required ARIA attributes
- [ ] Implement keyboard navigation
- [ ] Ensure responsive design (mobile, tablet, desktop)
- [ ] Minimum touch target size (44px height on mobile)

### Create Profile Page (`/auth/create-profile`)
- [ ] Create profile form with: name, avatar upload
- [ ] Remove email field from create-profile (captured in register)
- [ ] Make avatar upload OPTIONAL
- [ ] Show avatar preview after file selection
- [ ] Implement name length validation (min 2 chars)
- [ ] Implement name required validation
- [ ] Show loading spinner during submission
- [ ] Disable button during submission
- [ ] Handle success → redirect to `/dashboard`
- [ ] Handle errors (network, server)
- [ ] Add all required data-testid attributes
- [ ] Add all required ARIA attributes
- [ ] Implement keyboard navigation
- [ ] Ensure responsive design (mobile, tablet, desktop)
- [ ] Minimum touch target size (44px height on mobile)

### Dashboard Page
- [ ] Display user name with `data-testid="user-name"`
- [ ] Display user avatar with `data-testid="user-avatar"` (if exists)

---

## Test Execution

```bash
cd app
npm run test:e2e
```

**Expected Result:** All tests should FAIL initially, then PASS as you implement the components.

---

## Notes for Implementation

1. **Do NOT modify the tests** - they are the immutable specification
2. **Follow exact data-testid naming** - tests depend on these
3. **Implement ALL accessibility features** - WCAG 2.1 AA compliance mandatory
4. **Use shadcn/ui components** - maintain consistency with design system
5. **Use Tailwind CSS only** - no traditional CSS
6. **Use TanStack Query** - for server state management
7. **Use Zod validation** - for form validation
8. **Use React Hook Form** - for form state management

---

## Questions?

If any test specification is unclear, ask the Test Agent for clarification. Do NOT modify tests to make implementation easier - tests define the contract.