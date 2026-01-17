# Socratic Bot Wireframes & Mockups

## Overview
These wireframes represent "The Conversational Room" — a minimal, patient interface for critical thinking.

## Homepage / Initial State

```
┌─────────────────────────────────────────┐
│                                         │
│         [Soft Gradient Background]      │
│         (morning fog / clean paper)    │
│                                         │
│              [2 second pause]           │
│                                         │
│         "What's on your mind            │
│          right now?" |                  │
│              (slow blinking cursor)     │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Soft gradient background
- Centered, minimal content
- Patient pause before question appears
- Slow-blinking cursor (1.2s interval)
- No avatars, no decorative elements

## Wallet Connection Flow

```
┌─────────────────────────────────────────┐
│                                         │
│         [Soft Gradient Background]      │
│                                         │
│         "To begin, connect              │
│          your wallet."                  │
│                                         │
│         "Your identity and memory       │
│          will be tied to your           │
│          wallet address."               │
│                                         │
│         [Connect Wallet]                │
│         (subtle border, hover state)    │
│                                         │
└─────────────────────────────────────────┘
```

**After Connection:**
```
┌─────────────────────────────────────────┐
│                                         │
│         Connected: 0x1234...5678        │
│         (monospace font)                │
│                                         │
│         "Your identity is tied to       │
│          this wallet. Your thinking     │
│          is yours."                     │
│                                         │
└─────────────────────────────────────────┘
```

## Chat Interface

```
┌─────────────────────────────────────────┐
│                                         │
│         [Message Area]                  │
│                                         │
│         "What's on your mind            │
│          right now?"                    │
│                                         │
│         [User message]                  │
│         (right-aligned, gray)           │
│                                         │
│         [Tutor response]                │
│         (left-aligned, gentle)          │
│         "Let's slow that down.          │
│          What makes that part           │
│          feel solid?"                    │
│                                         │
│         [Listening indicator]          │
│         • • • (gentle pulse)           │
│                                         │
│         ────────────────────            │
│         [Reflection Layer]              │
│         "Here's how I'm understanding  │
│          you so far..."                 │
│         (faded, invites correction)      │
│                                         │
│         ────────────────────            │
│         [Text Input]                    │
│         "Take your time..."             │
│         [Send]                          │
│                                         │
└─────────────────────────────────────────┘
```

**Key Features:**
- No bold text, no highlights
- Questions are clean and short
- Listening indicator: gentle pulse, not "typing"
- Reflection layer appears after multiple messages
- Earlier messages fade but remain visible

## Memory Visualization

```
┌─────────────────────────────────────────┐
│                                         │
│         Your Thinking Journey           │
│                                         │
│         "Memories stored in Swarm,      │
│          connected by your reasoning." │
│                                         │
│         ┌─────────────────────┐         │
│         │ Explored concept of │         │
│         │ inference vs        │         │
│         │ observation         │         │
│         │ Jan 15, 2024        │         │
│         │ Connected to 1 other│         │
│         └─────────────────────┘         │
│         (opacity: 100%)                 │
│                                         │
│         ┌─────────────────────┐         │
│         │ Discussed importance│         │
│         │ of questioning      │         │
│         │ assumptions         │         │
│         │ Jan 16, 2024        │         │
│         │ Connected to 2 other│         │
│         └─────────────────────┘         │
│         (opacity: 90%)                  │
│                                         │
│         ┌─────────────────────┐         │
│         │ Reflected on how to │         │
│         │ slow down thinking  │         │
│         │ Jan 17, 2024        │         │
│         │ Connected to 1 other │         │
│         └─────────────────────┘         │
│         (opacity: 80%)                  │
│                                         │
│         ────────────────────            │
│         "All memories are encrypted      │
│          and stored in Swarm.           │
│          Only you can access them       │
│          with your wallet."             │
│                                         │
└─────────────────────────────────────────┘
```

**Key Features:**
- Older memories fade (opacity decreases)
- Shows connections between thoughts
- Emphasizes privacy and ownership
- No flashy visualizations, just clear information

## Silence / Long Pause State

```
┌─────────────────────────────────────────┐
│                                         │
│         [Previous conversation]         │
│         (faded to background)           │
│                                         │
│         [No flashing]                  │
│         [No nudges]                     │
│         [No timers]                     │
│                                         │
│         [After long pause]             │
│         "Take your time. This part       │
│          is worth sitting with."        │
│         (gentle, patient)               │
│                                         │
└─────────────────────────────────────────┘
```

## Emotional Adaptation State

```
┌─────────────────────────────────────────┐
│                                         │
│         [User shows frustration/         │
│          certainty/defensiveness]      │
│                                         │
│         [UI adapts subtly]             │
│         - Language softens              │
│         - Questions widen               │
│         - No popups or alerts           │
│                                         │
│         "What would it mean if          │
│          this weren't true?"            │
│         (wider question)                │
│                                         │
│         "Is there anything at           │
│          stake for you here?"           │
│         (gentle, attuned)               │
│                                         │
└─────────────────────────────────────────┘
```

## Session End

```
┌─────────────────────────────────────────┐
│                                         │
│         [Conversation history]          │
│         (faded)                         │
│                                         │
│         "What's one thing you           │
│          noticed about how you          │
│          were thinking today?"          │
│                                         │
│         [User response]                 │
│                                         │
│         "Carry that with you.           │
│          We can build from there        │
│          next time."                    │
│                                         │
│         [Room fades]                    │
│         (not closed, not logged out)   │
│         (just resting)                  │
│                                         │
└─────────────────────────────────────────┘
```

## Design Principles Applied

1. **Minimal**: No unnecessary elements
2. **Patient**: Slow animations, generous pauses
3. **Respectful**: No judgment, no "wrong" indicators
4. **Attuned**: Adapts to emotional state
5. **Owned**: User owns their data (wallet-tied)
6. **Private**: Encrypted, decentralized storage

## Responsive Breakpoints

- **Mobile (320px+)**: Single column, full-width input
- **Tablet (640px+)**: Slightly wider, more spacing
- **Desktop (1024px+)**: Max-width container (672px), centered

## Accessibility Considerations

- High contrast text (WCAG AA)
- Keyboard navigable
- Screen reader friendly
- Respects `prefers-reduced-motion`
- Semantic HTML structure
