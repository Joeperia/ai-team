# Target Repo Requirements for `implement-design`

For the skill to work end-to-end against a new target repository.

## Required packages

### `dependencies`
- `aperia-ds5` (or its `@<org>/components` alias) — the design system library
- `react`
- `react-dom`

> The library should declare `react` / `react-dom` as **peerDependencies** so versions are not pinned in two places.

### `devDependencies`
- `typescript`, `@types/react`, `@types/react-dom`
- `tailwindcss` (v4)
- `@tailwindcss/postcss`
- One bundler that supports Tailwind v4 + ESM. The skill itself is bundler-agnostic — RSBuild, Vite, Webpack, Next.js App Router all work.

### No longer needed (vs. the prototype)
- ~~`shadcn` CLI~~ — the library exposes everything; nothing to scaffold
- ~~`tw-animate-css`~~ — animations live inside the library
- ~~`components.json`~~ — there is no shadcn CLI to configure

### Optional
- Storybook — if installed, the skill offers to scaffold a story for the new component

## Required files

- **`src/globals.css`** (or equivalent entry CSS) that imports Tailwind and the library's token CSS, e.g.:

  ```css
  @import "tailwindcss";
  @import "@<org>/components/styles/token.css";
  ```

  An example ships with the library docs — copy verbatim, do not re-author per repo.

- **Bundler config** — `rsbuild.config.ts`, `vite.config.ts`, `next.config.mjs`, etc., wired to Tailwind v4
- **`postcss.config.{js,mjs}`** — only if the bundler uses PostCSS (RSBuild, Webpack)
- **`tsconfig.json`** — standard project config

## Recommended outside the repo

- **The Figma file should be Code Connect-mapped to the library.** When mappings exist, the skill uses them as the source of truth. When they don't, it falls back to looking up components by name in the library's barrel exports, and finally to plain HTML elements styled with library design tokens. Partial coverage is fine; full coverage produces the most faithful results.

## Conventional file layout

The skill detects and reuses the repo's existing component-placement pattern. For brand-new repos, default to:

```
src/
  components/
    <ComponentName>/
      <ComponentName>.tsx
      index.ts        # barrel re-export
```

If the team prefers flat files (`src/<ComponentName>.tsx`), record it in `CLAUDE.md` so the skill picks it up.
