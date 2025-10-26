# Dark Mode Optimization Reference

**Purpose**: Best practices for implementing and optimizing dark mode theming.

**When to Consult**: Dark mode implementation, theme switching, color adjustments, visual consistency across modes.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/tailwindlabs/tailwindcss",
  topic: "dark mode theming CSS variables color scheme prefers-color-scheme",
  tokens: 3000
})
```

---

## Dark Mode Setup (next-themes)

### Provider Configuration
```tsx
// app/providers.tsx
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"              // Use class-based strategy
      defaultTheme="system"          // Respect system preference
      enableSystem                   // Enable system detection
      disableTransitionOnChange      // Prevent flash during theme change
    >
      {children}
    </ThemeProvider>
  )
}
```

### Theme Toggle Component
```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

---

## Dark Mode Color Strategy

### Semantic Color Variables
```css
/* globals.css */
@layer base {
  :root {
    /* Light mode colors */
    --background: 0 0% 100%;          /* Pure white */
    --foreground: 230 38% 25%;        /* Dark navy text */
    --primary: 235 33% 43%;           /* Medium purple */
    --muted: 236 100% 96%;            /* Very light lavender */
    --border: 236 50% 90%;            /* Subtle border */
  }

  .dark {
    /* Dark mode colors */
    --background: 230 38% 8%;         /* Very dark navy */
    --foreground: 236 100% 96%;       /* Light lavender text */
    --primary: 236 76% 72%;           /* Brighter purple */
    --muted: 230 38% 15%;             /* Darker muted */
    --border: 230 38% 20%;            /* Darker border */
  }
}
```

### Usage in Components
```tsx
// Colors automatically adapt to theme
<div className="bg-background text-foreground border border-border">
  Content adapts to light/dark mode
</div>

<Button className="bg-primary text-primary-foreground">
  Button adapts to theme
</Button>
```

---

## Dark Mode Best Practices

### 1. Reduce Pure Blacks and Whites
```tsx
// ❌ BAD: Pure black/white
<div className="bg-black text-white">
  Too harsh in dark mode
</div>

// ✅ GOOD: Off-black, off-white
<div className="bg-background text-foreground">
  Softer, more comfortable
</div>
```

### 2. Elevate Surfaces with Lighter Colors
```tsx
// In dark mode, elevation = lighter color
<div className="bg-background">           {/* Base: darkest */}
  <Card className="bg-card">              {/* Elevated: slightly lighter */}
    <div className="bg-muted">            {/* More elevated: even lighter */}
      Layered surfaces
    </div>
  </Card>
</div>
```

### 3. Adjust Shadows for Visibility
```css
/* Light mode: Dark shadows */
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Dark mode: Lighter shadows with higher opacity */
.dark {
  --shadow-sm: 0 1px 2px 0 rgb(255 255 255 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(255 255 255 / 0.1);
}
```

```tsx
// Tailwind dark mode shadows
<Card className="shadow-md dark:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]">
  Visible shadow in both modes
</Card>
```

### 4. Maintain Semantic Color Meaning
```tsx
// Error color should remain red in both modes
<span className="text-destructive">
  Error message (red in both light and dark)
</span>

// Success should remain green
<span className="text-green-600 dark:text-green-400">
  Success message
</span>
```

---

## Dark Mode Components

### Cards with Proper Elevation
```tsx
<Card className="
  bg-card
  border-border
  dark:bg-card          /* Slightly lighter than background */
  dark:border-border    /* Visible border in dark */
">
  <CardHeader className="border-b border-border">
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

### Inputs with Dark Mode Support
```tsx
<Input className="
  bg-background
  border-input
  text-foreground
  placeholder:text-muted-foreground
  focus:ring-2
  focus:ring-ring
  dark:bg-background
  dark:border-input
" />
```

### Buttons with Theme Variants
```tsx
// Primary button (adapts automatically)
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

// Secondary button
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  Secondary Action
</Button>

// Ghost button (invisible background)
<Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
  Ghost Action
</Button>
```

---

## Images & Media in Dark Mode

### Logo Variants
```tsx
import { useTheme } from 'next-themes'
import Image from 'next/image'

export function Logo() {
  const { theme } = useTheme()

  return (
    <Image
      src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Logo"
      width={120}
      height={40}
    />
  )
}

// Or with CSS
<Image
  src="/logo-light.svg"
  alt="Logo"
  className="block dark:hidden"
/>
<Image
  src="/logo-dark.svg"
  alt="Logo"
  className="hidden dark:block"
/>
```

### Image Filters
```tsx
// Reduce brightness of images in dark mode
<Image
  src="/photo.jpg"
  alt="Photo"
  className="dark:brightness-90 dark:contrast-90"
/>

// Invert icons (if using monochrome)
<img
  src="/icon.svg"
  alt="Icon"
  className="dark:invert"
/>
```

---

## Charts & Data Visualization

### Color Palette for Both Modes
```css
:root {
  --chart-1: 235 33% 43%;   /* Primary */
  --chart-2: 236 76% 72%;   /* Secondary */
  --chart-3: 236 100% 88%;  /* Tertiary */
  --chart-4: 230 38% 25%;   /* Quaternary */
  --chart-5: 200 50% 50%;   /* Accent */
}

.dark {
  --chart-1: 236 76% 72%;   /* Brighter primary */
  --chart-2: 236 100% 88%;  /* Brighter secondary */
  --chart-3: 235 33% 43%;   /* Darker tertiary */
  --chart-4: 200 50% 50%;   /* Accent */
  --chart-5: 280 50% 60%;   /* Complementary */
}
```

```tsx
// Usage in chart library
<Bar
  data={chartData}
  options={{
    backgroundColor: [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
    ]
  }}
/>
```

---

## Smooth Theme Transitions

### Root Element Transition
```tsx
// Add to root HTML element
<html className="transition-colors duration-300">
  {children}
</html>
```

### Component-Level Transitions
```tsx
// Smooth color transitions
<div className="
  bg-background
  text-foreground
  border-border
  transition-colors duration-300
">
  Content
</div>
```

### Disable Transition on Theme Change
```tsx
// Prevent flash during theme switch
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange  // ← Prevents transition flash
>
  {children}
</ThemeProvider>
```

---

## Dark Mode Accessibility

### Color Contrast Verification
```bash
# Both modes must meet WCAG 2.1 AA
Light mode: 4.5:1 minimum (normal text)
Dark mode: 4.5:1 minimum (normal text)

# Common mistakes:
❌ Light gray text on dark gray background (2.5:1)
✅ Light lavender on dark navy (5.8:1)
```

### Focus Indicators
```tsx
// Ensure focus ring is visible in both modes
<Button className="
  focus:ring-2
  focus:ring-ring          /* Adapts to theme */
  focus:ring-offset-2
  focus:ring-offset-background
">
  Accessible in both modes
</Button>
```

### Respect System Preferences
```tsx
// Automatically detect system preference
<ThemeProvider defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>

// CSS media query fallback
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode variables */
  }
}
```

### Reduce Motion in Dark Mode
```tsx
// Respect prefers-reduced-motion
<div className="
  transition-all
  motion-reduce:transition-none
  dark:transition-colors
  dark:motion-reduce:transition-none
">
  Respects user preferences
</div>
```

---

## Testing Dark Mode

### Manual Testing Checklist
- [ ] All text readable in both modes (4.5:1 contrast)
- [ ] Borders visible in both modes
- [ ] Shadows visible in dark mode
- [ ] Images have appropriate variants
- [ ] Focus indicators visible in both modes
- [ ] Charts/graphs readable in both modes
- [ ] Loading states visible in both modes
- [ ] Error states visible in both modes
- [ ] Smooth transition between modes

### Automated Testing
```typescript
// Playwright test for dark mode
test('should render correctly in dark mode', async ({ page }) => {
  // Set dark mode
  await page.emulateMedia({ colorScheme: 'dark' })

  await page.goto('/dashboard')

  // Take screenshot
  await page.screenshot({ path: 'dark-mode.png' })

  // Verify elements are visible
  await expect(page.locator('header')).toBeVisible()
})
```

### Chrome DevTools
```bash
# Rendering panel → Emulate CSS media feature
prefers-color-scheme: dark

# Or toggle via command menu
Ctrl+Shift+P → "Rendering" → "Emulate CSS media feature prefers-color-scheme"
```

---

## Common Dark Mode Pitfalls

### 1. Pure Black Backgrounds
```tsx
// ❌ Avoid: Pure black (#000000)
// Causes eye strain, no depth perception

// ✅ Use: Off-black with hue
<div className="bg-[hsl(230,38%,8%)]">
  Softer, more comfortable
</div>
```

### 2. Insufficient Contrast
```tsx
// ❌ Avoid: Gray on gray
<span className="text-gray-400 dark:text-gray-600">
  Too low contrast (2.1:1)
</span>

// ✅ Use: Semantic colors
<span className="text-muted-foreground">
  Sufficient contrast (4.8:1)
</span>
```

### 3. Ignoring Elevation
```tsx
// ❌ Avoid: Same color for all surfaces
<div className="bg-background">
  <Card className="bg-background">Same color</Card>
</div>

// ✅ Use: Lighter colors for elevation
<div className="bg-background">
  <Card className="bg-card">Elevated surface</Card>
</div>
```

### 4. Forgetting Images
```tsx
// ❌ Avoid: Single logo for both modes
<img src="/logo.svg" alt="Logo" />

// ✅ Provide: Dark mode variant
<img src="/logo-light.svg" className="block dark:hidden" />
<img src="/logo-dark.svg" className="hidden dark:block" />
```

---

**Update Policy**: Refresh when Tailwind CSS or next-themes add new dark mode features, or when design trends evolve.
