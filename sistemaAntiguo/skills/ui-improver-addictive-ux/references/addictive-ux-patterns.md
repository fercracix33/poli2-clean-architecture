# Addictive UX Patterns Reference

**Purpose**: Psychology-backed patterns that create engaging, habit-forming user experiences.

**When to Consult**: Creating engagement loops, gamification, user retention features.

**Sources**: Hooked model (Nir Eyal), Dopamine-driven design, BJ Fogg's Behavior Model, Variable reward schedules.

---

## 1. The Hook Model (Nir Eyal)

### Trigger → Action → Variable Reward → Investment

**Implementation**:
```tsx
// Trigger: Notification badge
<Bell className="relative">
  <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
</Bell>

// Action: Simple click
<Button onClick={handleOpen}>Check</Button>

// Variable Reward: Random encouragement
const rewards = ["Great!", "Awesome!", "Perfect!", "Amazing!"]
const reward = rewards[Math.floor(Math.random() * rewards.length)]

// Investment: Progress saved
<Progress value={userProgress} />
```

---

## 2. Variable Reward Schedules

### Pattern: Randomized Positive Feedback
**Psychology**: Unpredictable rewards create stronger habits than predictable ones.

```tsx
const feedbackMessages = [
  { emoji: "🎉", text: "Fantastic work!" },
  { emoji: "✨", text: "You're on fire!" },
  { emoji: "🚀", text: "Incredible!" },
  { emoji: "💪", text: "Keep it up!" },
  { emoji: "🌟", text: "Amazing progress!" },
]

const randomFeedback = () => {
  const random = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className="flex items-center gap-2 text-primary font-medium"
    >
      <span className="text-2xl">{random.emoji}</span>
      <span>{random.text}</span>
    </motion.div>
  )
}
```

---

## 3. Progress & Completion

### Pattern: Visual Progress Indicators
**Psychology**: Clear progress creates momentum and reduces abandonment.

```tsx
export function ProgressCircle({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100
  const circumference = 2 * Math.PI * 45

  return (
    <div className="relative w-32 h-32">
      <svg className="transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <motion.span
          key={percentage}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold"
        >
          {current}/{total}
        </motion.span>
      </div>
    </div>
  )
}
```

### Pattern: Milestone Celebrations
**Psychology**: Celebrating achievements reinforces behavior.

```tsx
{percentage === 100 && (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="text-center"
  >
    <div className="text-4xl mb-2">🎉</div>
    <div className="text-lg font-semibold text-primary">All Done!</div>
    <div className="text-sm text-muted-foreground">You're amazing!</div>
  </motion.div>
)}
```

---

## 4. Streaks & Consistency

### Pattern: Streak Counter
**Psychology**: Loss aversion makes users continue streaks.

```tsx
export function StreakCounter({ days }: { days: number }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        >
          <Flame className="h-12 w-12 text-orange-500" />
        </motion.div>
        <div>
          <div className="text-4xl font-bold">{days}</div>
          <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Come back tomorrow to keep your streak going!
      </div>
    </Card>
  )
}
```

---

## 5. Gamification Elements

### Pattern: Points & Levels
**Psychology**: Progression systems tap into achievement motivation.

```tsx
export function UserLevel({ xp }: { xp: number }) {
  const level = Math.floor(xp / 1000)
  const xpForNextLevel = (level + 1) * 1000
  const currentLevelXp = xp % 1000
  const progress = (currentLevelXp / 1000) * 100

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm text-muted-foreground">Level {level}</div>
          <div className="text-2xl font-bold">{xp.toLocaleString()} XP</div>
        </div>
        <Trophy className="h-10 w-10 text-primary" />
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-xs text-muted-foreground mt-2">
        {1000 - currentLevelXp} XP to Level {level + 1}
      </div>
    </Card>
  )
}
```

### Pattern: Achievement Badges
**Psychology**: Collection mechanics and completionism.

```tsx
export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {badges.map(badge => (
        <motion.div
          key={badge.id}
          whileHover={badge.unlocked ? { scale: 1.1 } : {}}
          className={cn(
            "aspect-square rounded-lg border-2 p-3 flex flex-col items-center justify-center",
            badge.unlocked
              ? "border-primary bg-primary/10"
              : "border-muted opacity-50 grayscale"
          )}
        >
          <div className="text-2xl">{badge.icon}</div>
          <div className="text-xs mt-1 text-center">{badge.name}</div>
          {badge.unlocked && (
            <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
          )}
        </motion.div>
      ))}
    </div>
  )
}
```

---

## 6. Social Proof & FOMO

### Pattern: Live Activity Indicator
**Psychology**: Social presence creates urgency and validation.

```tsx
export function LiveActivity({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <Users className="h-3 w-3" />
      <span>{count} users online now</span>
    </motion.div>
  )
}
```

### Pattern: Recent Actions Feed
**Psychology**: Activity creates perceived value and FOMO.

```tsx
export function ActivityFeed({ actions }: { actions: Action[] }) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {actions.map((action, i) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={action.userAvatar} />
              <AvatarFallback>{action.userName[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{action.userName}</span>
            <span className="text-muted-foreground">{action.action}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(action.timestamp)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

---

## 7. Instant Feedback

### Pattern: Haptic-like Button Press
**Psychology**: Immediate tactile feedback creates satisfaction.

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 17
  }}
  className="relative overflow-hidden bg-primary text-primary-foreground px-6 py-3 rounded-lg"
>
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ scale: 0, opacity: 0.5 }}
    whileTap={{ scale: 2, opacity: 0 }}
    transition={{ duration: 0.5 }}
  />
  Click Me
</motion.button>
```

### Pattern: Success State Morph
**Psychology**: Clear state transitions reduce uncertainty.

```tsx
export function ActionButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleClick = async () => {
    setState('loading')
    await performAction()
    setState('success')
    setTimeout(() => setState('idle'), 2000)
  }

  return (
    <Button onClick={handleClick} className="relative min-w-[120px]">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Save
          </motion.span>
        )}
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
```

---

## 8. Scarcity & Urgency

### Pattern: Countdown Timer
**Psychology**: Time pressure creates urgency.

```tsx
export function CountdownTimer({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState(deadline.getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(deadline.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-destructive" />
      <motion.span
        key={seconds}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-destructive font-mono font-bold"
      >
        {hours}h {minutes}m {seconds}s
      </motion.span>
      <span className="text-sm text-muted-foreground">remaining</span>
    </div>
  )
}
```

---

**Update Policy**: Refresh when new UX psychology research emerges or successful patterns are identified in production.
