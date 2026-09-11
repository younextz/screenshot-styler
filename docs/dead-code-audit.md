# Dead-code audit — 2026-09-11

## Scope and method

Traced the app from `index.html` and `src/main.tsx`, reviewed package scripts,
build/deployment configuration, public assets, and component usage. Used EmbArk
semantic search, repository reference searches, TypeScript unused-code checks,
and Knip 6.35.1. No application module was unreachable.

Knip was run without adding a project dependency. Local `.claude/**` worktrees
and archived `.zenflow/**` task scripts were excluded from its scan. Their
contents are historical or separate working copies, not this app's entry graph.
A clean scan does not prove externally invoked configuration is unused.

## Removed

- Legacy `bun.lockb`: setup, Docker, and Workers builds all use npm and
  `package-lock.json`. Updated the README's installation guidance.
- `public/favicon.ico.backup`: unreferenced backup; both actual favicon formats
  are linked by `index.html` and remain in place.
- `screenshots/capture-themes.mjs`: targets the former dark/light website theme,
  uses removed theme selectors, and imports undeclared Playwright. Historical
  screenshot images and archived task artifacts remain available.
- `test-results/.last-run.json`: generated browser-test state. Added ignores for
  test results and Playwright reports.
- Button `asChild` support, unused variants and sizes, and the now-unused
  `@radix-ui/react-slot` dependency (including its compose-refs dependency).
  Preserved the small export buttons' dimensions and default/ghost appearance.
- Duplicate named/default component exports and unused exported helper types.
- Tailwind scan paths for nonexistent directories, unused container overrides,
  sidebar/card/popover/input/destructive tokens, and unused custom animations.

## Prevention

ESLint now rejects unused variables, with an underscore-prefix escape hatch for
intentionally unused arguments, variables, and catch bindings. Both TypeScript projects reject unused
locals and parameters. `npm run typecheck` checks the app plus Vite and Tailwind
configuration; the production build already runs this command.

## Retained findings

| Item | Evidence / disposition |
| --- | --- |
| Dockerfile, Compose, nginx | Compose references the Dockerfile and the Dockerfile uses nginx.conf. This is an externally runnable workflow, so it is not confirmed dead. It is stale: Node 20 conflicts with the package's Node 22.12+ requirement, and nginx's root SPA fallback does not match the current `/ss/` packaging. |
| Java devcontainer | Configures Java, Maven, and Gradle for a Node application. No Java source or build manifest was found. IDE entry points can be used externally; replace or remove this separately if that environment is retired. |
| Lovable tagger | Still wired into Vite development mode; not an unused dependency. |
| Shadcn components.json | Generator configuration, not a runtime import. Retained with the existing UI component workflow. |
| Junie workflow / Air settings | Externally triggered automation and IDE configuration; absence of application imports is expected. |
| tailwindcss-animate | Used by the full-size preview's backdrop entrance/fade animation. |
| public/.assetsignore | Still excludes future backup files from deployment. |
| Historical plans, screenshots, .zenflow | Audit/design history, not application dead code. Some documents describe former features; retained as historical records. |

## Validation

- ESLint passes.
- App and configuration TypeScript checks pass.
- All 27 tests across 7 files pass.
- Production build and Workers asset packaging pass.
- Knip reports no findings with the worktree/archive exclusions above.
- Browser smoke check with `test.png`: both backgrounds embed successfully, all
  export controls enable, full-size preview loads, Escape closes it, and its
  backdrop animation remains active. Export buttons retain their 36px height.
