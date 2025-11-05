# Project Guidance for Agents

- Stack: Vite + React + TypeScript + Tailwind. Components live in `src/components`, hooks in `src/hooks`.
- Styling: prefer Tailwind utilities; order classes layout → spacing → typography → color → effects. Add custom CSS only in `src/styles/` when utilities fall short.
- Code style: follow nearby patterns, keep components focused, export helpers when needed, and move shared logic to `src/utils`. Use explicit types—avoid `any`.
- State & accessibility: stick with React hooks, ensure keyboard support and ARIA on interactive elements.
- Key files: touch `index.html` and `src/main.tsx` sparingly; keep imports tidy. Components should export a default plus helper types if required.
- Workflow: run `npm run lint` (and tests) before committing, keep commits focused, document behavior changes, and summarize PRs while noting new dependencies.
- Communication: leave `TODO`s only with tickets and explain non-obvious code paths with concise comments.

Thanks for keeping the project consistent!
