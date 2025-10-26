# WCAG 2.1 AA Accessibility Reference

**Purpose**: WCAG 2.1 Level AA compliance guidelines for accessible UI improvements.

**When to Consult**: Color contrast issues, keyboard navigation, ARIA labels, screen reader support.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/w3c/wcag",
  topic: "color contrast keyboard navigation focus ARIA labels",
  tokens: 3000
})
```

---

## Color Contrast Requirements

### WCAG 2.1 Level AA
- **Normal text** (<18pt): 4.5:1 minimum
- **Large text** (≥18pt or ≥14pt bold): 3:1 minimum
- **UI components & graphics**: 3:1 minimum
- **Active UI components**: 3:1 minimum against adjacent colors

### Testing Tools
```bash
# WebAIM Contrast Checker
https://webaim.org/resources/contrastchecker/

# Chrome DevTools (Inspect element → Accessibility pane)
# Shows contrast ratio automatically

# Automated testing
npm install --save-dev axe-core @axe-core/playwright
```

### Common Fixes
```tsx
// ❌ BAD: Insufficient contrast
<span className="text-gray-400">Secondary text</span>  // 2.8:1 on white

// ✅ GOOD: Sufficient contrast
<span className="text-muted-foreground">Secondary text</span>  // 4.8:1 on white
```

---

## Keyboard Navigation

### Tab Order
```tsx
// Ensure logical tab order with tabIndex
<form>
  <Input id="name" tabIndex={1} />      // First
  <Input id="email" tabIndex={2} />     // Second
  <Button type="submit" tabIndex={3}>Submit</Button>  // Third
</form>

// Avoid positive tabIndex (use 0 or -1 only)
// tabIndex={0} = natural order
// tabIndex={-1} = programmatically focusable only
```

### Keyboard Event Handlers
```tsx
// Support Enter and Space for buttons
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Custom Button
</div>

// Escape to close modals
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
}, [onClose])

// Arrow keys for lists
<div
  role="listbox"
  onKeyDown={(e) => {
    if (e.key === 'ArrowDown') {
      focusNextItem()
    } else if (e.key === 'ArrowUp') {
      focusPreviousItem()
    }
  }}
>
  {items}
</div>
```

### Skip to Content Link
```tsx
// Mandatory for keyboard users
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

---

## Focus Management

### Visible Focus Indicators
```css
/* MANDATORY: Always visible focus ring */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 2px;
}

/* ❌ NEVER remove focus indicators */
/* *:focus { outline: none; } */
```

```tsx
// Tailwind focus classes
<Button className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
  Accessible Button
</Button>

<Input className="focus-visible:ring-2 focus-visible:ring-ring" />
```

### Focus Trap (Modals)
```tsx
import { useEffect, useRef } from 'react'

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    // Get all focusable elements
    const focusableElements = modal.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element
    firstElement?.focus()

    // Trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => modal.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
```

### Focus Restoration
```tsx
// Save previous focus and restore on close
const previousFocusRef = useRef<HTMLElement | null>(null)

const openModal = () => {
  previousFocusRef.current = document.activeElement as HTMLElement
  setIsOpen(true)
}

const closeModal = () => {
  setIsOpen(false)
  previousFocusRef.current?.focus()
}
```

---

## ARIA Labels & Roles

### Icon-Only Buttons
```tsx
// ❌ BAD: No label
<Button variant="ghost" size="icon">
  <X className="h-4 w-4" />
</Button>

// ✅ GOOD: aria-label
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="h-4 w-4" />
</Button>
```

### Form Labels
```tsx
// ❌ BAD: No label
<Input type="email" placeholder="Email" />

// ✅ GOOD: Visible label
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />

// ✅ ALSO GOOD: aria-label (if no visible label)
<Input type="email" aria-label="Email address" />
```

### Form Validation
```tsx
// Error messages with aria-describedby
<div>
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    aria-invalid={hasError}
    aria-describedby={hasError ? "password-error" : undefined}
  />
  {hasError && (
    <span id="password-error" className="text-sm text-destructive">
      Password must be at least 8 characters
    </span>
  )}
</div>

// Required fields
<Label htmlFor="name">
  Full Name <span aria-label="required" className="text-destructive">*</span>
</Label>
<Input id="name" required aria-required="true" />
```

### Loading States
```tsx
// aria-busy for loading
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// Live regions for dynamic content
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Alert for important updates
<div role="alert" className="text-destructive">
  {errorMessage}
</div>
```

### Custom Components
```tsx
// Accordion
<div>
  <button
    aria-expanded={isOpen}
    aria-controls="section-content"
    onClick={() => setIsOpen(!isOpen)}
  >
    Section Title
  </button>
  <div id="section-content" hidden={!isOpen}>
    Content
  </div>
</div>

// Tabs
<div role="tablist">
  <button role="tab" aria-selected={activeTab === 'profile'} aria-controls="profile-panel">
    Profile
  </button>
  <button role="tab" aria-selected={activeTab === 'settings'} aria-controls="settings-panel">
    Settings
  </button>
</div>
<div role="tabpanel" id="profile-panel" hidden={activeTab !== 'profile'}>
  Profile content
</div>
```

---

## Screen Reader Support

### Semantic HTML
```tsx
// ✅ GOOD: Use semantic elements
<main>
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      <p>Content</p>
    </section>
  </article>
</main>

// ❌ BAD: Generic divs
<div>
  <div>
    <div className="text-2xl font-bold">Page Title</div>
  </div>
</div>
```

### Screen Reader Only Text
```tsx
// Visually hidden but read by screen readers
<span className="sr-only">
  This text is only for screen readers
</span>

// Example: Icon with SR text
<Button>
  <span className="sr-only">Search</span>
  <Search className="h-4 w-4" />
</Button>
```

### Hide Decorative Content
```tsx
// Decorative images
<img src="decoration.svg" alt="" role="presentation" />

// Decorative icons
<ChevronRight className="h-4 w-4" aria-hidden="true" />
```

---

## Checklist for UI Improvements

### Color & Contrast
- [ ] All text meets 4.5:1 contrast (normal text)
- [ ] Large text meets 3:1 contrast
- [ ] UI components meet 3:1 contrast
- [ ] Error states have sufficient contrast
- [ ] Focus indicators have 3:1 contrast

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys work for menus/lists
- [ ] Skip to content link present

### Focus Management
- [ ] Focus indicators are visible (2px minimum)
- [ ] Focus indicators have sufficient contrast
- [ ] Focus trap in modals
- [ ] Focus restoration on close
- [ ] No focus on non-interactive elements

### ARIA & Semantics
- [ ] Icon-only buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Error messages use aria-describedby
- [ ] Required fields marked with aria-required
- [ ] Loading states use aria-busy
- [ ] Dynamic content uses aria-live
- [ ] Semantic HTML used (main, article, section, nav)

### Screen Readers
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Decorative content hidden (aria-hidden or alt="")
- [ ] Important updates announced (role="alert")
- [ ] Status messages announced (role="status")
- [ ] Screen reader only text where needed (sr-only)

---

**Update Policy**: Refresh when WCAG updates or new accessibility best practices emerge.
