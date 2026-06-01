# `implement-design` — Developer Guide

Turn a Figma design into a real React/TypeScript page in a target repo, built from the
design-system library that repo **already has installed** (`aperia-ds5` / `@<org>/components`).
Principle: **composition, not invention** — reuse library primitives, never create new ones.

Full spec: [`SKILL.md`](./SKILL.md).

## Invoke

```
/implement-design <figma-link> <target-repo-name>
```

Or just describe it with both a Figma reference and a repo name. Inputs: a **Figma**
URL/node-ID and the **target repo** path. Missing or ambiguous → it asks, never guesses.

**Scope:** layout/composition only. It won't add business logic (auth, data fetching, form
submission, routing) or wire the component into your app — you import it yourself.

Full checklist: [`target-repo-requirements.md`](./target-repo-requirements.md). Preflight with
the `check-library-compat` skill.

## The five phases

1. **Orient** — reads `package.json` + sample files to detect the library, your component
   location (flat vs directory+barrel) and declaration style. Halts if the library isn't
   installed.
2. **Read Figma** — captures components, variants, layout, and every text string verbatim;
   decides whether to decompose.
3. **Confirm (hard gate)** — presents an inventory (mappings, resolution tiers, decomposition
   plan, prop types, output paths, any existing-file conflicts) and **waits for your OK**.
   Existing files → you choose **Replace / Update / new path** per file.
4. **Implement** — writes sub-components then the page, renders text verbatim, honors your
   per-file choice. Never edits entry-point/router files.
5. **Storybook (asks)** — opt in → stories carry Figma values as `args`; skip → values become
   prop destructure defaults. Mentions `/verify-design` for a fidelity check.

You mainly interact at **Phase 3** and **Phase 5**.

## Resolution tiers

Each component resolves to one of:

1. **Confirmed** — Code Connect mapping exists → use as-is.
2. **Inferred** — no mapping, name matches a library export → use it, with the real prop
   signature from source.
3. **Improvised** — no match → plain HTML + library design tokens.

Tiers 2–3 are surfaced in Phase 3, not blockers. Real blockers: library not installed, or the
design needs a primitive the library doesn't have.

## What you get

Multi-section designs decompose into co-located sub-components plus an assembling page; a
single card/form stays one file.

```
src/components/Dashboard/
  Dashboard.tsx          ← assembles the sections
  StatCard.tsx           ← one section, rendered ×N by the page
  DashboardHeader.tsx
  Dashboard.stories.tsx  ← if you opt into Storybook
```

The page exposes one prop per sub-component, typed from the sub itself — so a sub's props flow
up with no duplication:

```ts
type DashboardProps = {
  header?: React.ComponentProps<typeof DashboardHeader>
  stats?: React.ComponentProps<typeof StatCard>[]   // [] for repeated items
  className?: string
}
```

Every prop is optional, text is rendered verbatim from Figma, and JSX consumes prop variables
— captured values live in story `args` (Storybook) or destructure defaults (skip). Output
matches your repo's detected file layout and declaration style.
