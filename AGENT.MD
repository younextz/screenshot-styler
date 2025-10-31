# Project Guidance for Agents

Welcome to the **screenshot-styler** project. This document outlines conventions and workflows that all agents must follow when making changes.

## Repository Overview
- The project is a Vite + React + TypeScript application styled primarily with Tailwind CSS.
- UI components are organized under `src/components/`, while reusable hooks live in `src/hooks/`.
- Styles are largely declarative via Tailwind utility classes; avoid custom CSS unless Tailwind cannot express the design.

## General Contribution Rules
1. **Follow Existing Patterns:** Before adding new functionality, inspect nearby files to match coding style, naming conventions, and component structure.
2. **Type Safety:** Always prefer explicit TypeScript types and interfaces. Avoid using `any`—leverage discriminated unions or generics when appropriate.
3. **Component Structure:**
   - Use functional components and React hooks.
   - Keep components focused; extract helpers into the same file if they are component-specific, or into `src/utils/` when reusable.
4. **State Management:** Use React state/hooks. Only introduce new global state libraries after confirming none already exist.
5. **Styling:**
   - Use Tailwind classes defined in `tailwind.config.ts`.
   - Keep class lists sorted logically (layout → spacing → typography → color → effects).
   - If custom CSS is necessary, place it in `src/styles/` and reference it explicitly.
6. **Accessibility:** Ensure interactive elements have appropriate ARIA labels and keyboard interactions.
7. **Testing:**
   - Run `npm run lint` and `npm run test` when applicable.
   - For visual changes, update or add screenshots using the provided tooling if possible.
8. **Documentation:** Update `README.md` or relevant docs when introducing new features or modifying existing workflows.
9. **Pull Requests:**
   - Provide concise summaries highlighting user-facing changes.
   - Mention any new dependencies and justify their inclusion.

## File-Specific Notes
- `index.html`: Only adjust metadata or root mounting points when necessary.
- `src/main.tsx`: Keep imports tidy and grouped; avoid side effects.
- `src/components/`: Each component should export a default component and named helper types if needed.
- `tailwind.config.ts`: Update this file cautiously; ensure new utilities align with project design tokens.

## Git Workflow
1. Create focused commits with descriptive messages.
2. Run formatting commands (`npm run lint`, `npm run format`) before committing.
3. Ensure the commit history stays clean—squash or rebase locally if required.

## Communication
- Leave `TODO` comments only when follow-up work is tracked. Reference ticket numbers when available.
- Document non-obvious implementation details directly in the code using succinct comments.

Following this guidance will keep the project maintainable and consistent. Thank you for contributing!
