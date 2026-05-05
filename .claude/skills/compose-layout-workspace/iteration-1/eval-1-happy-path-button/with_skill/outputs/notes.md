# compose-layout eval-1: happy-path button

## Phase 1 — Library detection

- **Design system library (from `package.json`):** `$SHADCN_COMPONENT_LIBRARY_PACKAGE`
  - Found in `dependencies` of `../$TARGET_REPO/package.json`
  - Resolved via `file:../$SHADCN_COMPONENT_LIBRARY` (sibling repo on disk)
  - Confirmed installed; exports `Button`, `buttonVariants`, plus `Alert`, `Checkbox`, `Field`, `Input`, `Label`, `Separator` from its root barrel (`./components/ui/index.ts`)
- **Framework:** Library-style repo (rslib build, MUI-based legacy pages). Project is not a typical Next.js/Vite app — `src/pages/` holds page-level compositions exported by the library itself.
- **CLAUDE.md:** Not present at repo root.
- **Existing page convention examined:** `src/pages/landing/LandingPage.tsx` (MUI/Tap-prefixed primitives — legacy MUI track, distinct from the new shadcn-style `$SHADCN_COMPONENT_LIBRARY_PACKAGE` track that the Figma file is wired to).

## Phase 2 — Figma read

- **Node:** `1037:71589` (Button instance), 350×36 px
- **Code Connect mapping (present):**
  - `componentName`: `Button`
  - `source`: `https://github.com/thuannguyen13/$SHADCN_COMPONENT_LIBRARY/blob/main/components/ui/button/button.tsx`
  - Snippet: `<Button variant="default" size="default" shape="default">Sign in with Email</Button>`
- **Variables:** `general/primary` `#f54a00`, `general/primary foreground` `#fafafa`, font Geist 14px / 20 line-height / Semibold. Already encoded in the library's `bg-primary text-primary-foreground` classes — no overrides needed.

## Phase 3 — Inventory

```
Components inventoried
----------------------
1) Button ($SHADCN_COMPONENT_LIBRARY_PACKAGE)
   - import: import { Button } from "$SHADCN_COMPONENT_LIBRARY_PACKAGE"
   - props:  variant="default", size="default", shape="default"
   - children: "Sign in with Email"
   - Code Connect mapping: PRESENT (node 1037:71589 -> Button)

Missing Code Connect mappings: NONE

Layout
------
Single button, full-width inside a 350px container, vertically/horizontally
centered on the page. Uses semantic Tailwind tokens (bg-background) — no raw
colors, no pixel-token overrides.
```

## Phase 4 — Implementation

- **Eval write target (used):** `.claude/skills/compose-layout-workspace/iteration-1/eval-1-happy-path-button/with_skill/outputs/page.tsx`
- **Output path that would have been used in the real repo:** `../$TARGET_REPO/src/pages/signInWithEmail/SignInWithEmailPage.tsx` (mirrors the `src/pages/landing/LandingPage.tsx` convention — one folder per page, PascalCase filename suffixed `Page.tsx`).
- **Imports used:** root barrel only — `import { Button } from "$SHADCN_COMPONENT_LIBRARY_PACKAGE"`. No deep imports, no `shadcn add`, no local primitives.

## Assumptions / blockers

- **Two design system tracks coexist in the target repo.** Existing `src/pages/*.tsx` files use MUI-based `TapButton/TapBox/TapGrid` from `../../common`. The new `$SHADCN_COMPONENT_LIBRARY_PACKAGE` package is the shadcn-style library that the Figma file (`Aperia-Shadcn`) is code-connected to. Per the skill's rule ("derive the library from `package.json` every single run; trust Code Connect"), I used `$SHADCN_COMPONENT_LIBRARY_PACKAGE`. If the team intends the Figma to map onto MUI/Tap primitives instead, this is a human decision — flagging.
- **No CLAUDE.md** at the target repo root, so conventions were inferred only from existing pages and `package.json`.
- **No blocking missing mappings.** The single component (Button) has a Code Connect mapping with all required props.

## Inventory summary (plain text)

Library: $SHADCN_COMPONENT_LIBRARY_PACKAGE (file dep -> ../$SHADCN_COMPONENT_LIBRARY)
Components:
  - Button  (variant=default, size=default, shape=default, children="Sign in with Email")
    import { Button } from "$SHADCN_COMPONENT_LIBRARY_PACKAGE"
Missing mappings: none
Output path (real repo): src/pages/signInWithEmail/SignInWithEmailPage.tsx
Output path (this eval): outputs/page.tsx
