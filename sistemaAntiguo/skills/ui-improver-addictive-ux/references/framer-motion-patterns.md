# Framer Motion Patterns Reference

**Purpose**: Advanced animation patterns for addictive UX using Framer Motion.

**When to Consult**: Adding complex animations, spring physics, gesture interactions, stagger effects.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/framer/motion",
  topic: "spring animations stagger variants gestures drag useAnimation",
  tokens: 5000
})
```

---

## Spring Animations (Satisfying Feel)

### Basic Spring Configuration
```tsx
import { motion } from 'framer-motion'

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{
    type: "spring",
    stiffness: 400,  // Higher = snappier (100-500 range)
    damping: 17      // Lower = more bounce (10-30 range)
  }}
>
  Click Me
</motion.button>
```

### Spring Presets
```tsx
// Snappy (buttons, quick interactions)
const snappy = { type: "spring", stiffness: 400, damping: 17 }

// Gentle (cards, panels)
const gentle = { type: "spring", stiffness: 300, damping: 25 }

// Bouncy (celebration moments)
const bouncy = { type: "spring", stiffness: 200, damping: 10 }

// Slow (large layout changes)
const slow = { type: "spring", stiffness: 100, damping: 20 }
```

---

## Stagger Animations (List Entrances)

### Basic Stagger
```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1
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
```

### Advanced Stagger (Multiple Properties)
```tsx
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      staggerDirection: 1  // 1 = forward, -1 = reverse
    }
  }
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}
```

---

## Gesture Animations (Drag, Swipe)

### Drag
```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}
  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
  whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
>
  Drag me
</motion.div>
```

### Swipe to Dismiss
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(e, { offset, velocity }) => {
    if (offset.x > 100 || velocity.x > 500) {
      // Dismiss
      controls.start({ x: 300, opacity: 0 })
    } else {
      // Snap back
      controls.start({ x: 0 })
    }
  }}
>
  Swipe to dismiss
</motion.div>
```

---

## Layout Animations (Shared Element Transitions)

### Layout Prop (Auto-animate layout changes)
```tsx
<motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
  {expanded ? <FullContent /> : <Summary />}
</motion.div>
```

### Shared Layout Animation
```tsx
import { AnimateSharedLayout } from 'framer-motion'

<AnimateSharedLayout>
  {items.map(item => (
    <motion.div
      key={item.id}
      layoutId={item.id}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimateSharedLayout>
```

---

## Advanced Patterns

### Morphing Button (Loading → Success)
```tsx
const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle')

<motion.button
  layout
  onClick={() => setState('loading')}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
  className="relative overflow-hidden"
>
  <AnimatePresence mode="wait">
    {state === 'idle' && (
      <motion.span
        key="idle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        Save Changes
      </motion.span>
    )}
    {state === 'loading' && (
      <motion.div
        key="loading"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        exit={{ opacity: 0 }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <Loader2 className="h-4 w-4" />
      </motion.div>
    )}
    {state === 'success' && (
      <motion.div
        key="success"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <Check className="h-4 w-4" />
      </motion.div>
    )}
  </AnimatePresence>
</motion.button>
```

### Path Drawing (SVG Animation)
```tsx
<motion.svg viewBox="0 0 100 100">
  <motion.path
    d="M 10 50 L 90 50"
    stroke="currentColor"
    strokeWidth={2}
    fill="none"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 1, ease: "easeInOut" }}
  />
</motion.svg>
```

---

**Update Policy**: Refresh when Framer Motion releases new features or patterns emerge from Context7.
