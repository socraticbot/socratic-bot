# Socratic Bot Design System

## Philosophy
The design system embodies "The Conversational Room" — a quiet, patient space for thinking. It minimizes performance pressure, maximizes epistemic safety, and keeps thinking in the foreground.

## Colors

### Background
- **Primary Background**: Soft gradient from `#f5f7fa` → `#e8ecef` → `#f0f2f5`
  - Represents "morning fog and clean paper"
  - Does not demand attention, gives it back

### Text
- **Primary Text**: `#2c2c2c` (soft black, not harsh)
- **Secondary Text**: `#666666` (gentle gray for quotes/questions)
- **Muted Text**: `#999999` (for faded background elements)

### Accents
- **Cursor**: `#666666` with 30-100% opacity (slow, patient blink)
- **Borders**: `#e0e0e0` (subtle, non-intrusive)
- **Highlights**: None — nothing is bolded or highlighted as "correct"

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Scale
- **Question/Prompt**: `text-2xl` (24px), `font-light`, `leading-relaxed`
- **Body Text**: `text-lg` (18px), `leading-relaxed`
- **Small Text**: `text-base` (16px), `leading-normal`

### Principles
- Sentences are short
- Questions are clean
- Nothing is bolded
- Nothing is highlighted as "correct"
- Language is spare

## Spacing

### Principles
- Generous whitespace
- No crowding
- Room to breathe
- Respect for silence

### Scale
- **Container Padding**: `p-8` (32px) minimum
- **Section Spacing**: `space-y-4` to `space-y-6`
- **Max Width**: `max-w-2xl` (672px) for readability

## Components

### Conversational Room
- Minimal container
- Soft gradient background
- Centered content
- Patient animations (fade-in, slow transitions)

### Question/Prompt
- Appears after a pause (2 seconds)
- Unhurried fade-in animation
- Slow-blinking cursor (1.2s interval)
- No bold, no highlights

### Listening Indicator
- Gentle, rhythmic pulse
- Not "typing" or "processing"
- Feels like attention being held
- Subtle opacity animation

### Thinking Reflection
- Earlier words fade into background
- Still visible, but muted
- New layer appears above: "Here's how I'm understanding you so far"
- Tentative reconstruction, invites correction

### Silence Handler
- No flashing
- No nudges
- No timers
- After long pause: "Take your time. This part is worth sitting with."

### Emotional Adaptation
- Language softens when emotional charge detected
- Questions widen instead of narrowing
- No popups or alerts
- Conversational attunement

## Animations

### Principles
- Slow and patient
- Never rushed
- Respectful of user's thinking time
- Subtle, not attention-grabbing

### Transitions
- **Fade In**: `0.8s ease-in` for questions
- **Cursor Blink**: `1.2s` interval, `opacity 30-100%`
- **Opacity Changes**: `duration-500` (0.5s) for smooth transitions

## States

### Initial State
- Empty room
- Soft gradient background
- Pause (2 seconds)
- Question appears unhurriedly

### Listening State
- Gentle pulse indicator
- No "typing" or "processing" text
- Feels like attention

### Reflecting State
- Earlier text fades to background
- New understanding appears above
- Invitation to correct

### Silent State
- No flashing
- No nudges
- Patient waiting
- Optional gentle prompt after long pause

## Accessibility

### Principles
- Screen reader friendly
- Keyboard navigable
- High contrast (WCAG AA minimum)
- No motion for users who prefer reduced motion

### Implementation
- Semantic HTML
- ARIA labels where needed
- Focus states visible but subtle
- Respect `prefers-reduced-motion`

## Responsive Design

### Breakpoints
- Mobile: Default (320px+)
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+), `lg:` (1024px+)

### Principles
- Maintains quiet, patient feel on all sizes
- Generous spacing scales appropriately
- Text remains readable
- No layout shifts that disrupt thinking
