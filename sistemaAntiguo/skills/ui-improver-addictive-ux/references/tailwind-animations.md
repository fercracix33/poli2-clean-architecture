# Tailwind Animations Reference

**Purpose**: CSS-based animations using Tailwind utilities for performance and simplicity.

**When to Consult**: Simple transitions, hover effects, loading states, responsive animations.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/tailwindlabs/tailwindcss",
  topic: "animations transitions arbitrary values dark mode responsive",
  tokens: 4000
})
```

---

## Built-in Tailwind Animations

### Spin (Loading Indicators)
```tsx
<Loader2 className="animate-spin h-4 w-4" />

// Custom speed
<div className="animate-spin duration-1000">Loading...</div>
```

### Ping (Notification Badges)
```tsx
<div className="relative">
  <Bell className="h-6 w-6" />
  <span className="absolute -top-1 -right-1 flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
  </span>
</div>
```

### Pulse (Skeleton Loading)
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-muted rounded w-3/4"></div>
  <div className="h-4 bg-muted rounded"></div>
  <div className="h-4 bg-muted rounded w-5/6"></div>
</div>
```

### Bounce (Attention Grabber)
```tsx
<Button className="animate-bounce">
  New Message!
</Button>
```

---

## Custom Animations (tailwind.config.js)

### Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-out': 'fadeOut 0.2s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.4s ease-in-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
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
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
}
```

### Usage
```tsx
// Fade in on mount
<div className="animate-fade-in">Content</div>

// Slide in from right
<Card className="animate-slide-in-right">New Card</Card>

// Scale in
<Button className="animate-scale-in">Click Me</Button>

// Wiggle (error state)
<Input className="animate-wiggle border-destructive" />
```

---

## Transition Utilities

### Duration
```tsx
// Default durations
<div className="transition duration-75">75ms</div>
<div className="transition duration-100">100ms</div>
<div className="transition duration-150">150ms</div>
<div className="transition duration-200">200ms</div>  // Micro-interactions
<div className="transition duration-300">300ms</div>  // Layout changes
<div className="transition duration-500">500ms</div>  // Page transitions

// Custom duration
<div className="transition duration-[250ms]">Custom 250ms</div>
```

### Easing
```tsx
// Built-in easing
<div className="transition ease-linear">Linear</div>
<div className="transition ease-in">Ease In</div>
<div className="transition ease-out">Ease Out</div>
<div className="transition ease-in-out">Ease In-Out</div>

// Custom easing (cubic-bezier)
<div className="transition ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]">
  Custom easing
</div>
```

### Delay
```tsx
<div className="transition delay-75">75ms delay</div>
<div className="transition delay-100">100ms delay</div>
<div className="transition delay-150">150ms delay</div>
<div className="transition delay-200">200ms delay</div>
```

---

## Common Patterns

### Button Hover Effect
```tsx
<Button className="
  transition-all duration-200
  hover:bg-primary/90
  hover:scale-[1.02]
  active:scale-95
">
  Hover Me
</Button>
```

### Card Lift Effect
```tsx
<Card className="
  transition-all duration-300
  hover:-translate-y-1
  hover:shadow-lg
  hover:border-primary/50
">
  Card Content
</Card>
```

### Input Focus Effect
```tsx
<Input className="
  transition-all duration-200
  focus:ring-2
  focus:ring-ring
  focus:border-transparent
  focus:scale-[1.01]
" />
```

### Loading Skeleton
```tsx
<div className="space-y-2">
  <div className="h-4 bg-muted rounded animate-pulse" />
  <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
  <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
</div>
```

### Notification Badge
```tsx
<div className="relative">
  <Bell className="h-6 w-6" />
  <span className="
    absolute -top-1 -right-1
    h-4 w-4 rounded-full bg-destructive
    animate-pulse
    flex items-center justify-center text-xs text-white
  ">
    3
  </span>
</div>
```

### Staggered List (CSS-only)
```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-slide-in-up"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {item.content}
  </div>
))}
```

---

## Performance Best Practices

### GPU-Accelerated Properties (✅ GOOD)
```tsx
// These trigger GPU acceleration (smooth 60fps)
<div className="transition-transform">...</div>
<div className="transition-opacity">...</div>
<div className="transition-all">...</div>  // Use sparingly
```

### Layout-Triggering Properties (❌ AVOID)
```tsx
// These cause layout recalculation (janky)
<div className="transition-[width]">...</div>
<div className="transition-[height]">...</div>
<div className="transition-[top]">...</div>
<div className="transition-[left]">...</div>
```

### Conditional Hover (Pointer Devices Only)
```tsx
// Only apply hover on devices with pointer (not touch)
<Button className="hover:bg-accent @media (hover: hover)">
  Desktop Hover
</Button>
```

---

## Dark Mode Animations

### Smooth Theme Transition
```tsx
// Add to root element
<html className="transition-colors duration-300">
  {children}
</html>
```

### Dark Mode Toggle Animation
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
>
  <Sun className="
    h-5 w-5
    rotate-0 scale-100
    transition-all duration-300
    dark:-rotate-90 dark:scale-0
  " />
  <Moon className="
    absolute h-5 w-5
    rotate-90 scale-0
    transition-all duration-300
    dark:rotate-0 dark:scale-100
  " />
</Button>
```

---

## Responsive Animations

### Disable Animations on Mobile
```tsx
// Reduce motion for accessibility
<div className="
  motion-safe:animate-bounce
  motion-reduce:animate-none
">
  Bouncing element
</div>

// Different animations per breakpoint
<div className="
  animate-slide-in-up
  md:animate-fade-in
  lg:animate-scale-in
">
  Responsive animation
</div>
```

---

**Update Policy**: Refresh when Tailwind releases new animation utilities or patterns emerge from Context7.
