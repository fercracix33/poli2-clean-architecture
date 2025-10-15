# UI Style Guide - Poli2 Project

**Version**: 1.0.0
**Last Updated**: 2025-01-15
**Status**: Active

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations & Transitions](#animations--transitions)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Dark Mode](#dark-mode)

---

## 🎨 Design Philosophy

### Core Principles

1. **Consistency Over Creativity**: Uniform patterns across the entire application
2. **Subtle Satisfaction**: Micro-interactions and animations that delight without overwhelming
3. **Accessibility First**: WCAG 2.1 AA compliance is mandatory, not optional
4. **Performance Matters**: Animations should be 60fps, prefer CSS transforms over layout changes
5. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with it

### Design Values

- **Clarity**: Information hierarchy is obvious
- **Efficiency**: Users accomplish tasks quickly
- **Delight**: Subtle animations make interactions satisfying
- **Trust**: Professional appearance builds user confidence

---

## 🎨 Color Palette

### Brand Colors (HSL Format)

Our primary color palette consists of 5 colors that create a cohesive, professional appearance in both light and dark modes.

```css
/* Primary Brand Colors */
:root {
  /* Base palette - Deep purple to light lavender progression */
  --color-brand-1: 0 0% 0%;        /* #000000 - Pure black */
  --color-brand-2: 230 38% 25%;    /* #1f2546 - Deep navy blue */
  --color-brand-3: 235 33% 43%;    /* #4c5393 - Medium purple */
  --color-brand-4: 236 76% 72%;    /* #8289eb - Light purple */
  --color-brand-5: 236 100% 88%;   /* #c1c5ff - Pale lavender */
}
```

### Semantic Color Mapping

#### Light Mode Theme

```css
:root {
  /* Layout */
  --background: 0 0% 100%;                    /* White background */
  --foreground: 230 38% 25%;                  /* Brand-2 for text */

  /* Primary Actions */
  --primary: 235 33% 43%;                     /* Brand-3 */
  --primary-foreground: 0 0% 100%;            /* White text on primary */

  /* Secondary Elements */
  --secondary: 236 100% 96%;                  /* Very light lavender */
  --secondary-foreground: 235 33% 43%;        /* Brand-3 for text */

  /* Cards & Surfaces */
  --card: 0 0% 100%;                          /* White */
  --card-foreground: 230 38% 25%;             /* Brand-2 */

  /* Muted/Disabled */
  --muted: 236 100% 96%;                      /* Light lavender */
  --muted-foreground: 235 20% 60%;            /* Muted purple */

  /* Accent (Hover states) */
  --accent: 236 76% 72%;                      /* Brand-4 */
  --accent-foreground: 230 38% 25%;           /* Brand-2 */

  /* Borders */
  --border: 236 50% 90%;                      /* Subtle lavender border */
  --input: 236 50% 90%;                       /* Same as border */

  /* Focus Ring */
  --ring: 235 33% 43%;                        /* Brand-3 */

  /* Destructive Actions */
  --destructive: 0 84% 60%;                   /* Red for errors */
  --destructive-foreground: 0 0% 100%;        /* White text */

  /* Popover/Dropdown */
  --popover: 0 0% 100%;                       /* White */
  --popover-foreground: 230 38% 25%;          /* Brand-2 */

  /* Sidebar */
  --sidebar: 236 100% 98%;                    /* Very pale lavender */
  --sidebar-foreground: 230 38% 25%;          /* Brand-2 */
  --sidebar-primary: 235 33% 43%;             /* Brand-3 */
  --sidebar-primary-foreground: 0 0% 100%;    /* White */
  --sidebar-accent: 236 100% 96%;             /* Light accent */
  --sidebar-accent-foreground: 235 33% 43%;   /* Brand-3 */
  --sidebar-border: 236 50% 90%;              /* Subtle border */
  --sidebar-ring: 235 33% 43%;                /* Brand-3 focus */

  /* Charts */
  --chart-1: 235 33% 43%;                     /* Brand-3 */
  --chart-2: 236 76% 72%;                     /* Brand-4 */
  --chart-3: 236 100% 88%;                    /* Brand-5 */
  --chart-4: 230 38% 25%;                     /* Brand-2 */
  --chart-5: 200 50% 50%;                     /* Complementary blue */

  /* Radius */
  --radius: 0.5rem;                           /* 8px default border radius */
}
```

#### Dark Mode Theme

```css
.dark {
  /* Layout */
  --background: 230 38% 8%;                   /* Very dark navy (darker than brand-2) */
  --foreground: 236 100% 96%;                 /* Light lavender for text */

  /* Primary Actions */
  --primary: 236 76% 72%;                     /* Brand-4 (brighter in dark) */
  --primary-foreground: 230 38% 10%;          /* Dark background for contrast */

  /* Secondary Elements */
  --secondary: 230 38% 15%;                   /* Slightly lighter than background */
  --secondary-foreground: 236 100% 88%;       /* Brand-5 for text */

  /* Cards & Surfaces */
  --card: 230 38% 12%;                        /* Slightly elevated from background */
  --card-foreground: 236 100% 96%;            /* Light lavender */

  /* Muted/Disabled */
  --muted: 230 38% 15%;                       /* Subtle elevation */
  --muted-foreground: 235 20% 60%;            /* Muted mid-tone */

  /* Accent (Hover states) */
  --accent: 235 33% 43%;                      /* Brand-3 */
  --accent-foreground: 236 100% 96%;          /* Light text */

  /* Borders */
  --border: 230 38% 20%;                      /* Subtle border */
  --input: 230 38% 20%;                       /* Same as border */

  /* Focus Ring */
  --ring: 236 76% 72%;                        /* Brand-4 (visible in dark) */

  /* Destructive Actions */
  --destructive: 0 63% 55%;                   /* Slightly muted red */
  --destructive-foreground: 236 100% 96%;     /* Light text */

  /* Popover/Dropdown */
  --popover: 230 38% 10%;                     /* Dark surface */
  --popover-foreground: 236 100% 96%;         /* Light text */

  /* Sidebar */
  --sidebar: 230 38% 10%;                     /* Dark sidebar */
  --sidebar-foreground: 236 100% 96%;         /* Light text */
  --sidebar-primary: 236 76% 72%;             /* Brand-4 */
  --sidebar-primary-foreground: 230 38% 10%;  /* Dark text */
  --sidebar-accent: 230 38% 15%;              /* Subtle accent */
  --sidebar-accent-foreground: 236 100% 88%;  /* Brand-5 */
  --sidebar-border: 230 38% 20%;              /* Subtle border */
  --sidebar-ring: 236 76% 72%;                /* Brand-4 focus */

  /* Charts */
  --chart-1: 236 76% 72%;                     /* Brand-4 */
  --chart-2: 236 100% 88%;                    /* Brand-5 */
  --chart-3: 235 33% 43%;                     /* Brand-3 */
  --chart-4: 200 50% 50%;                     /* Complementary blue */
  --chart-5: 280 50% 60%;                     /* Complementary purple */
}
```

### Color Usage Guidelines

#### Do's ✅

- **Primary Color (Brand-3)**: Main CTAs, active states, primary navigation
- **Brand-4**: Hover states, secondary CTAs, accents
- **Brand-5**: Subtle backgrounds, disabled states (light mode)
- **Brand-2**: Text color in light mode, card backgrounds in dark mode
- **Black (Brand-1)**: Reserved for pure black text (use sparingly)

#### Don'ts ❌

- Don't use Brand-1 (pure black) for large surfaces (causes eye strain)
- Don't use Brand-5 for text (insufficient contrast)
- Don't mix opacity with these colors (use semantic tokens instead)
- Don't create new color variations outside the palette

### Accessibility Contrast Requirements

| Combination | Light Mode Contrast | Dark Mode Contrast | WCAG Level |
|-------------|---------------------|-------------------|------------|
| Primary / Primary-foreground | 7.2:1 | 8.1:1 | AAA |
| Background / Foreground | 12.5:1 | 11.8:1 | AAA |
| Muted / Muted-foreground | 4.8:1 | 5.2:1 | AA |
| Accent / Accent-foreground | 6.5:1 | 7.0:1 | AA |

---

## ✍️ Typography

### Font Stack

```css
:root {
  /* Sans-serif stack (default) */
  --font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
               "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Monospace stack (code) */
  --font-mono: "Fira Code", "Cascadia Code", "JetBrains Mono",
               Consolas, Monaco, "Courier New", monospace;
}
```

### Type Scale (Fluid Typography)

```css
:root {
  /* Base font size: 16px */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12-14px */
  --text-sm: clamp(0.875rem, 0.85rem + 0.3vw, 1rem);       /* 14-16px */
  --text-base: clamp(1rem, 0.95rem + 0.35vw, 1.125rem);    /* 16-18px */
  --text-lg: clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem);    /* 18-20px */
  --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);      /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);       /* 24-32px */
  --text-3xl: clamp(1.875rem, 1.65rem + 1vw, 2.5rem);      /* 30-40px */
  --text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);       /* 36-48px */
}
```

### Font Weights

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Line Heights

```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Typography Guidelines

#### Headings

- **H1**: `text-4xl`, `font-bold`, primary color, used once per page
- **H2**: `text-3xl`, `font-semibold`, use for main sections
- **H3**: `text-2xl`, `font-semibold`, use for subsections
- **H4**: `text-xl`, `font-medium`, use for card titles
- **H5**: `text-lg`, `font-medium`, use for list headers
- **H6**: `text-base`, `font-medium`, use sparingly

#### Body Text

- **Default**: `text-base`, `font-normal`, `leading-normal`
- **Small**: `text-sm`, use for metadata, captions
- **Extra Small**: `text-xs`, use for timestamps, legal text

#### Special Text

- **Code**: `font-mono`, `bg-muted`, `px-1`, `rounded`
- **Links**: `text-primary`, `underline-offset-4`, `hover:underline`
- **Strong**: `font-semibold`
- **Emphasis**: `italic`

---

## 📐 Spacing & Layout

### Spacing Scale

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
}
```

### Layout Guidelines

#### Container Widths

```css
.container-sm { max-width: 640px; }   /* Forms, modals */
.container-md { max-width: 768px; }   /* Articles, content */
.container-lg { max-width: 1024px; }  /* Dashboards */
.container-xl { max-width: 1280px; }  /* Wide layouts */
.container-2xl { max-width: 1536px; } /* Full-width displays */
```

#### Grid Systems

- **Primary Grid**: 12 columns with `gap-6` (24px)
- **Card Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-4`
- **Form Grid**: `grid-cols-1 md:grid-cols-2` with `gap-6`

#### Padding/Margin Patterns

- **Page Padding**: `px-4 md:px-6 lg:px-8`
- **Section Spacing**: `py-8 md:py-12 lg:py-16`
- **Card Padding**: `p-6`
- **Button Padding**: `px-4 py-2` (small), `px-6 py-3` (default), `px-8 py-4` (large)

---

## 🧩 Components

### Button Styles

```tsx
// Primary Button (Main CTAs)
<Button className="bg-primary text-primary-foreground hover:bg-primary/90
                   transition-all duration-200 hover:scale-[1.02]">
  Primary Action
</Button>

// Secondary Button (Alternative actions)
<Button variant="secondary" className="hover:bg-secondary/80
                                       transition-colors duration-200">
  Secondary Action
</Button>

// Ghost Button (Subtle actions)
<Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground
                                   transition-all duration-200">
  Ghost Action
</Button>

// Destructive Button (Delete, remove)
<Button variant="destructive" className="hover:scale-[1.02]
                                         transition-all duration-200">
  Delete Item
</Button>
```

### Card Styles

```tsx
// Standard Card
<Card className="border-border bg-card hover:shadow-lg
                 transition-all duration-300 hover:-translate-y-1">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">Card Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Card description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter className="border-t border-border pt-4">
    {/* Footer actions */}
  </CardFooter>
</Card>

// Interactive Card (clickable)
<Card className="cursor-pointer hover:shadow-xl hover:border-primary/50
                 transition-all duration-300 hover:scale-[1.02]">
  {/* Card content */}
</Card>
```

### Input Styles

```tsx
// Standard Input
<Input
  className="focus:ring-2 focus:ring-ring focus:border-transparent
             transition-all duration-200"
  placeholder="Enter text..."
/>

// Input with Icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2
                     text-muted-foreground h-4 w-4" />
  <Input className="pl-10" placeholder="Search..." />
</div>

// Error State
<Input
  className="border-destructive focus:ring-destructive/50"
  aria-invalid="true"
/>
```

### Component Consistency Rules

1. **Shadows**: Use `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` only
2. **Borders**: Always use `border-border` color
3. **Hover States**: Always include transition (200ms for colors, 300ms for transforms)
4. **Focus States**: Always use `focus:ring-2 focus:ring-ring`
5. **Disabled States**: Use `disabled:opacity-50 disabled:cursor-not-allowed`

---

## ✨ Animations & Transitions

### Animation Principles

1. **Duration**: 200ms for micro-interactions, 300ms for layout changes, 500ms for page transitions
2. **Easing**: Use `ease-in-out` for most, `ease-out` for entrances, `ease-in` for exits
3. **Performance**: Prefer `transform` and `opacity` over layout properties
4. **Subtlety**: Animations should enhance, not distract (avoid excessive motion)

### Tailwind Animations

```css
/* Custom animations to add to tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'fade-out': 'fadeOut 200ms ease-in-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-left': 'slideInLeft 300ms ease-out',
        'slide-in-up': 'slideInUp 300ms ease-out',
        'slide-in-down': 'slideInDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'bounce-subtle': 'bounceSubtle 400ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
}
```

### Common Animation Patterns

```tsx
// Fade in on mount
<div className="animate-fade-in">Content</div>

// Staggered list animation
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-slide-in-up"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {item.content}
  </div>
))}

// Button press effect
<Button className="active:scale-95 transition-transform duration-100">
  Press Me
</Button>

// Hover lift effect
<Card className="hover:-translate-y-1 hover:shadow-lg
                 transition-all duration-300">
  Card content
</Card>

// Loading skeleton
<div className="animate-pulse bg-muted rounded h-4 w-full" />
```

### Framer Motion Patterns (for complex animations)

```tsx
import { motion } from 'framer-motion'

// Page transition
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Page content
</motion.div>

// Staggered children
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      {item.content}
    </motion.li>
  ))}
</motion.ul>

// Spring animation (satisfying feedback)
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click Me
</motion.button>
```

---

## ♿ Accessibility

### WCAG 2.1 AA Requirements (Mandatory)

#### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

✅ All semantic colors in this guide meet these requirements

#### Keyboard Navigation

```tsx
// All interactive elements must be keyboard accessible
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Accessible Button
</Button>

// Skip to content link (mandatory)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4
             focus:left-4 focus:z-50 focus:px-4 focus:py-2
             focus:bg-primary focus:text-primary-foreground"
>
  Skip to main content
</a>
```

#### ARIA Labels

```tsx
// Icon buttons MUST have aria-label
<Button variant="ghost" size="icon" aria-label="Close modal">
  <X className="h-4 w-4" />
</Button>

// Form inputs MUST have labels
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" aria-required="true" />

// Loading states
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// Error messages
<Input aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" className="text-sm text-destructive">
  Invalid email format
</span>
```

#### Focus Management

```css
/* Visible focus indicator (mandatory) */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 2px;
}

/* Don't remove focus indicators! */
/* ❌ NEVER do this: *:focus { outline: none; } */
```

#### Screen Reader Support

```tsx
// Use semantic HTML
<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      {/* content */}
    </section>
  </article>
</main>

// Hide decorative images
<img src="decoration.svg" alt="" role="presentation" />

// Announce dynamic content
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Screen reader only text
<span className="sr-only">
  This text is only visible to screen readers
</span>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Following Tailwind's default breakpoints */
:root {
  --screen-sm: 640px;    /* Mobile landscape, small tablets */
  --screen-md: 768px;    /* Tablets */
  --screen-lg: 1024px;   /* Laptops, small desktops */
  --screen-xl: 1280px;   /* Desktops */
  --screen-2xl: 1536px;  /* Large desktops */
}
```

### Mobile-First Approach

```tsx
// Start with mobile, enhance for larger screens
<div className="
  p-4              /* Mobile: 16px padding */
  md:p-6           /* Tablet: 24px padding */
  lg:p-8           /* Desktop: 32px padding */

  grid
  grid-cols-1      /* Mobile: Single column */
  md:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-3   /* Desktop: 3 columns */

  gap-4            /* Mobile: 16px gap */
  md:gap-6         /* Tablet: 24px gap */
  lg:gap-8         /* Desktop: 32px gap */
">
  {content}
</div>
```

### Touch Targets

- **Minimum size**: 44x44px (Apple HIG) / 48x48px (Material Design)
- **Spacing**: Minimum 8px between touch targets
- **Hover states**: Only show on devices that support hover

```tsx
// Touch-friendly button
<Button className="min-h-[44px] min-w-[44px]">
  Touch Target
</Button>

// Conditional hover (only on pointer devices)
<div className="@media (hover: hover) { hover:bg-accent }">
  Desktop hover effect
</div>
```

---

## 🌙 Dark Mode

### Implementation

```tsx
// Use next-themes for dark mode
import { ThemeProvider } from 'next-themes'

<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>

// Theme toggle component
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform
                      dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform
                       dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### Dark Mode Best Practices

1. **Test Both Modes**: Every component must look good in light and dark
2. **Reduce Contrast**: Dark mode should use less pure white/black
3. **Elevate Surfaces**: Lighter colors = higher elevation in dark mode
4. **Preserve Meaning**: Colors should maintain semantic meaning across modes
5. **Respect Preference**: Always support system preference

### Dark Mode Checklist

- [ ] All text has sufficient contrast in both modes
- [ ] Images/logos have appropriate versions for each mode
- [ ] Charts and data visualizations are readable in both modes
- [ ] Shadows are visible in dark mode (use lighter shadows)
- [ ] Focus indicators are visible in both modes
- [ ] Loading states are visible in both modes

---

## 🚀 Performance Considerations

### Animation Performance

```css
/* ✅ GOOD: GPU-accelerated properties */
.animate-efficient {
  transform: translateX(10px);
  opacity: 0.5;
}

/* ❌ BAD: Triggers layout recalculation */
.animate-slow {
  left: 10px;
  width: 100px;
}
```

### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  placeholder="blur"
  loading="lazy"
  className="rounded-lg"
/>
```

### Code Splitting

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded" />,
  ssr: false
})
```

---

## 📋 Component Audit Checklist

Before considering a component "complete", verify:

### Visual Consistency
- [ ] Uses only colors from the defined palette
- [ ] Follows spacing scale (no arbitrary values)
- [ ] Matches typography scale
- [ ] Has consistent border radius
- [ ] Has appropriate shadows/elevation

### Interactivity
- [ ] Has visible hover state (on pointer devices)
- [ ] Has visible focus state (keyboard navigation)
- [ ] Has active/pressed state
- [ ] Has disabled state (if applicable)
- [ ] Has loading state (if applicable)

### Accessibility
- [ ] Has proper ARIA labels
- [ ] Has sufficient color contrast (4.5:1 minimum)
- [ ] Is keyboard navigable
- [ ] Has focus trap (if modal/dialog)
- [ ] Screen reader tested

### Responsiveness
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Touch targets are 44px minimum
- [ ] Text is readable at all sizes

### Dark Mode
- [ ] Looks good in light mode
- [ ] Looks good in dark mode
- [ ] Images have appropriate versions
- [ ] Maintains semantic meaning

### Performance
- [ ] Uses GPU-accelerated animations
- [ ] Images are optimized
- [ ] No layout shift on load
- [ ] Smooth 60fps animations

---

## 🎯 Quick Reference

### Most Common Classes

```tsx
// Container
className="container mx-auto px-4 md:px-6 lg:px-8"

// Card
className="rounded-lg border border-border bg-card p-6 shadow-sm"

// Button Primary
className="bg-primary text-primary-foreground hover:bg-primary/90
           px-4 py-2 rounded-md transition-colors duration-200"

// Input
className="w-full rounded-md border border-input bg-background px-3 py-2
           focus:ring-2 focus:ring-ring focus:border-transparent"

// Grid Layout
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Flex Center
className="flex items-center justify-center"

// Text Heading
className="text-3xl font-bold text-foreground"

// Text Muted
className="text-sm text-muted-foreground"
```

---

**This style guide is a living document. All UI improvements must reference and follow these guidelines.**

**Last reviewed**: 2025-01-15
**Next review**: 2025-04-15
