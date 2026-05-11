# AGENTS.md

Instructions for AI coding agents (and humans onboarding automation) working in **ng-ai-starter**.

## Project overview

- **Name:** `ng-ai-starter` (private npm workspace root).
- **Stack:** Angular ~21, TypeScript ~5.9, **Vitest** via `@angular/build:unit-test`, SCSS, **npm** (see `package.json` `packageManager`).
- **Layout:** Angular CLI **monorepo** with `newProjectRoot: "projects"`. Application and library sources live under `projects/`, not at the repository root.

## Repository layout

| Path | Role |
|------|------|
| `projects/sample/` | Primary example **application** (`sample` in `angular.json`). Source: `projects/sample/src/`. |
| `projects/@scope/schematics/` | **Custom Angular schematics** package (component generator, etc.). Built via root script `build:fz-schematics`. |
| `.cursor/rules/` | **Cursor rules** (`.mdc`): Angular, TypeScript, Jest-style testing notes, Playwright. Load or respect these when editing matching files. |
| `.agents/skills/` | **Agent skills** (`SKILL.md`): Angular developer workflow, new-app creation, and other workflows. |

Other apps or libraries may be added under `projects/` over time; **`angular.json` is the source of truth** for configured Angular projects.

## Commands (run from repo root)

- **Install:** `npm install`
- **Dev server (default app):** `npm start` / `ng serve` (targets configured default project)
- **Build app:** `npm run build` / `ng build`
- **Unit tests:** `npm test` / `ng test`
- **Test single file:** `npm run test:file -- path/to/file.spec.ts`
- **Build schematics package:** `npm run build:fz-schematics`

### Generating components (prefer project schematic)

For **new** components in this repo, prefer the **custom** schematic over raw `ng generate` when it matches the project’s folder conventions:

```bash
npm run schematics:component -- --project=<angular-project> --feature-path=<path-under-src-app> --component-type=c|p --name=<dash-case-name> --dry-run=false
```

- `c` = container (smart), `p` = presentational (dumb). See `.cursor/rules/angular/ng-component-generation.mdc` for the full questionnaire workflow.

To build the schematic CLI locally after changing `projects/@scope/schematics`:

```bash
npm run build:fz-schematics
```

## Code conventions (summary)

Detailed rules live in **`.cursor/rules/`**. Agents should load the relevant rule files for the files they edit. High-level expectations:

- **Angular:** Standalone components, `ChangeDetectionStrategy.OnPush`, `inject()`, **signals** for local state, reactive forms where applicable, lazy-loaded feature routes, `host` bindings instead of `@HostBinding` / `@HostListener`. Avoid `ngClass` / `ngStyle` in favor of `class` / `style` bindings.
- **Structure:** Features/domains under `src/app/<feature>/` with **`containers/`** vs **`components/`** per smart/dumb split (see `.cursor/rules/angular/ng-component-guide.mdc`).
- **File companions:** Components use `.ts`, `.html`, `.scss`, `.spec.ts` with aligned names.

If project rules conflict with generic Angular blog advice, **follow this repo’s `.cursor/rules` and existing patterns** in the same directory.

## Verification expectations

- After **non-trivial** Angular or schematic changes, run **`ng build`** (or `npm run build`) and fix reported errors before finishing.
- When changing tests or behavior, run **`npm test`** or targeted **`npm run test:file`** when appropriate.

## Markdown and docs

- Do **not** add or expand root-level documentation files unless the user asks for them; **`README.md`** is the human-oriented quick start.

## Skills

When a task matches a skill in `.agents/skills/` or `.cursor/skills/`, **read and follow** that skill’s `SKILL.md` (e.g. Angular developer guidelines, branch/PR workflows if present).
