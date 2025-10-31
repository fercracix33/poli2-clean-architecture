# Responsive Design Reference

**Purpose**: Mobile-first responsive design patterns using Tailwind breakpoints.

**When to Consult**: Multi-device layouts, responsive components, touch optimization.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/tailwindlabs/tailwindcss",
  topic: "responsive design mobile-first breakpoints container queries",
  tokens: 3000
})
```

---

## Tailwind Breakpoints

### Default Breakpoints
```css
/* Mobile first (default = mobile, no prefix) */
sm:  640px   /* Mobile landscape, small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops, small desktops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach
```tsx
// Start with mobile, progressively enhance
<div className="
  p-4           /* Mobile: 16px padding */
  md:p-6        /* Tablet: 24px padding */
  lg:p-8        /* Desktop: 32px padding */

  text-sm       /* Mobile: small text */
  md:text-base  /* Tablet: normal text */
  lg:text-lg    /* Desktop: large text */
">
  Content
</div>
```

---

## Responsive Grid Layouts

### Card Grids
```tsx
// 1 column mobile → 2 columns tablet → 3 columns desktop
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4
  md:gap-6
">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>

// Responsive gap
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
  {/* Smaller gap on mobile */}
</div>
```

### Form Layouts
```tsx
// Single column mobile, two columns desktop
<form className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2">
    <Label>Full Name</Label>
    <Input />
  </div>
  <div>
    <Label>Email</Label>
    <Input type="email" />
  </div>
  <div>
    <Label>Phone</Label>
    <Input type="tel" />
  </div>
</form>
```

### Sidebar Layouts
```tsx
// Stack on mobile, sidebar on desktop
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="lg:w-64 lg:flex-shrink-0">
    Sidebar
  </aside>
  <main className="flex-1">
    Main Content
  </main>
</div>
```

---

## Responsive Typography

### Fluid Typography
```tsx
// Using clamp() for smooth scaling
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Heading
</h1>

// Custom fluid size
<p style={{
  fontSize: 'clamp(1rem, 0.95rem + 0.35vw, 1.125rem)'
}}>
  Fluid paragraph
</p>
```

### Line Clamping
```tsx
// Show 2 lines on mobile, 3 on desktop
<p className="line-clamp-2 md:line-clamp-3">
  Long text that will be truncated...
</p>
```

---

## Touch Optimization

### Touch Target Sizes
```tsx
// Minimum 44x44px touch targets (Apple HIG)
<Button className="min-h-[44px] min-w-[44px] p-3">
  Touch-Friendly
</Button>

// Increase padding on mobile
<Button className="px-4 py-2 sm:px-6 sm:py-3">
  Responsive Padding
</Button>
```

### Touch Spacing
```tsx
// More spacing between touch targets on mobile
<div className="flex gap-3 sm:gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
  <Button>Action 3</Button>
</div>
```

### Conditional Hover
```tsx
// Only apply hover on pointer devices (not touch)
<Card className="@media (hover: hover) { hover:shadow-lg hover:-translate-y-1 }">
  Card content
</Card>

// Or with Tailwind arbitrary variant
<Card className="[@media(hover:hover)]:hover:shadow-lg">
  Card content
</Card>
```

---

## Responsive Navigation

### Mobile Menu
```tsx
export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav>
      {/* Mobile: Hamburger menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Desktop: Horizontal nav */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        <a href="/dashboard">Dashboard</a>
        <a href="/projects">Projects</a>
        <a href="/settings">Settings</a>
      </div>

      {/* Mobile: Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left">
          <nav className="flex flex-col gap-4">
            <a href="/dashboard">Dashboard</a>
            <a href="/projects">Projects</a>
            <a href="/settings">Settings</a>
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
```

---

## Responsive Images

### Next.js Image Component
```tsx
import Image from 'next/image'

// Responsive with layout fill
<div className="relative h-48 md:h-64 lg:h-80">
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>

// Different images per breakpoint (using picture)
<picture>
  <source media="(min-width: 1024px)" srcSet="/desktop.jpg" />
  <source media="(min-width: 768px)" srcSet="/tablet.jpg" />
  <img src="/mobile.jpg" alt="Description" />
</picture>
```

---

## Responsive Containers

### Max Width Containers
```tsx
// Responsive container widths
<div className="
  container
  mx-auto
  px-4          /* Mobile: 16px padding */
  md:px-6       /* Tablet: 24px padding */
  lg:px-8       /* Desktop: 32px padding */
  max-w-7xl     /* Max width: 1280px */
">
  Content
</div>

// Different max widths per breakpoint
<div className="
  max-w-full
  sm:max-w-sm
  md:max-w-md
  lg:max-w-lg
  xl:max-w-xl
  mx-auto
">
  Centered content
</div>
```

---

## Responsive Visibility

### Show/Hide Elements
```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  Desktop only content
</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">
  Mobile only content
</div>

// Different content per breakpoint
<div>
  <p className="sm:hidden">Mobile version</p>
  <p className="hidden sm:block lg:hidden">Tablet version</p>
  <p className="hidden lg:block">Desktop version</p>
</div>
```

---

## Common Responsive Patterns

### Hero Section
```tsx
<section className="
  py-12
  md:py-16
  lg:py-24
  px-4
  md:px-6
  lg:px-8
">
  <div className="container mx-auto">
    <h1 className="
      text-3xl
      md:text-4xl
      lg:text-5xl
      xl:text-6xl
      font-bold
      mb-4
      md:mb-6
    ">
      Hero Title
    </h1>
    <p className="
      text-base
      md:text-lg
      lg:text-xl
      text-muted-foreground
      max-w-2xl
    ">
      Hero description
    </p>
  </div>
</section>
```

### Dashboard Grid
```tsx
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
  md:gap-6
">
  {cards.map(card => (
    <Card key={card.id} className="p-4 md:p-6">
      {card.content}
    </Card>
  ))}
</div>
```

### Responsive Table
```tsx
// Horizontal scroll on mobile
<div className="overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr>
        <th className="px-3 py-2 md:px-6 md:py-3">Column 1</th>
        <th className="px-3 py-2 md:px-6 md:py-3">Column 2</th>
      </tr>
    </thead>
    <tbody>
      {/* rows */}
    </tbody>
  </table>
</div>

// Or stack cards on mobile
<div className="space-y-4 lg:hidden">
  {data.map(item => (
    <Card key={item.id}>
      <div className="p-4">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-muted-foreground">{item.email}</div>
      </div>
    </Card>
  ))}
</div>
<div className="hidden lg:block">
  <Table>{/* Desktop table */}</Table>
</div>
```

---

## Testing Responsive Design

### Chrome DevTools
```bash
# Open DevTools
F12 or Ctrl+Shift+I

# Toggle device toolbar
Ctrl+Shift+M

# Test common devices:
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad Air (820x1180)
- Desktop (1920x1080)
```

### Breakpoint Testing Checklist
- [ ] Mobile portrait (320px-480px)
- [ ] Mobile landscape (481px-767px)
- [ ] Tablet portrait (768px-1023px)
- [ ] Tablet landscape / Small desktop (1024px-1279px)
- [ ] Desktop (1280px-1535px)
- [ ] Large desktop (1536px+)

### Common Issues to Check
- [ ] Touch targets ≥44px on mobile
- [ ] Text readable without zoom
- [ ] Images scale properly
- [ ] Navigation accessible on mobile
- [ ] Forms usable on mobile
- [ ] No horizontal scroll
- [ ] Adequate spacing between elements

---

**Update Policy**: Refresh when Tailwind adds new responsive features or device landscape changes.
