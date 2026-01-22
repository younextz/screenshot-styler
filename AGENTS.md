# AGENTS.md

## Setup

- Run `npm install` to install dependencies
- Run `npm run dev` to start the development server
- Project uses Vite + React + TypeScript with Tailwind CSS

## Code Style

- Use functional components and React hooks
- Always prefer explicit TypeScript types and interfaces - avoid `any`
- Use discriminated unions or generics when appropriate
- Keep components focused and single-responsibility
- Extract reusable helpers to `src/utils/`, component-specific helpers stay in the same file

### File Organization

- UI components go in `src/components/`
- Reusable hooks go in `src/hooks/`
- Each component should export a default component and named helper types if needed
- Keep `src/main.tsx` imports tidy and grouped, avoid side effects

### Styling

- Use Tailwind utility classes defined in `tailwind.config.ts`
- Keep class lists sorted logically: layout → spacing → typography → color → effects
- Avoid custom CSS unless Tailwind cannot express the design
- If custom CSS is needed, place it in `src/styles/` and reference explicitly
- Update `tailwind.config.ts` cautiously, ensure new utilities align with project design tokens

## State Management

- Use React state/hooks for local state
- Only introduce new global state libraries after confirming none already exist

## Testing

- Run `npm run lint` before committing
- Run `npm run test` when applicable
- Run formatting commands (`npm run lint`, `npm run format`) before committing
- For visual changes, update or add screenshots using provided tooling if possible

## Pull Requests

- Create focused commits with descriptive messages
- Provide concise PR summaries highlighting user-facing changes
- Mention any new dependencies and justify their inclusion
- Ensure commit history stays clean - squash or rebase locally if required

## Accessibility

- Ensure interactive elements have appropriate ARIA labels
- Implement proper keyboard interactions for all interactive elements

## Documentation

- Update `README.md` when introducing new features or modifying workflows
- Leave `TODO` comments only when follow-up work is tracked with ticket numbers
- Document non-obvious implementation details with succinct inline comments

## Important Files

- `index.html`: Only adjust metadata or root mounting points when necessary
- `src/main.tsx`: Keep imports tidy and grouped, avoid side effects
- `src/components/`: Each component exports default + named types
- `tailwind.config.ts`: Update cautiously, align with design tokens

## Development Workflow

1. Follow existing patterns - inspect nearby files before adding functionality
2. Match coding style, naming conventions, and component structure
3. Ensure type safety throughout
4. Test changes with `npm run lint` and `npm run test`
5. Create focused commits with clear messages
6. Keep the project maintainable and consistent