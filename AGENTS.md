# Project Instructions

## Stack and Tooling
- Use React for UI development.
- Use Bun as runtime and package manager.
- Prefer Bun commands (`bun install`, `bun run`, `bun test`, `bunx`).

## Frontend Implementation Rules
- Follow React best practices: small reusable components, clear state boundaries, and predictable data flow.
- Prefer functional components and hooks.
- Use TypeScript-friendly patterns when TS is available.
- Keep components accessible: semantic HTML, keyboard navigation, focus states, and ARIA only when needed.

## Styling Rules
- Use Tailwind CSS by default.
- Use raw CSS only when Tailwind is insufficient or when advanced/custom effects are needed.
- Keep design tokens consistent (spacing, radius, colors, typography).

## Animation Rules
- Use Framer Motion for component/page animations.
- Prefer meaningful motion over excessive effects.
- Keep animations smooth and purposeful; use spring transitions for UI interactions.
- Respect reduced-motion preferences.
- Favor transform/opacity animations for performance.

## Quality Expectations
- Keep code readable and maintainable.
- Avoid overengineering; choose the simplest robust approach.
- Match existing project patterns when present.
- When adding UI, ensure it works on desktop and mobile.
