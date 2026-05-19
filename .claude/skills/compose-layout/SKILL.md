---
name: compose-layout
description: Implement a Figma design as a page or layout in a target repository, using whatever design system component library the target repo has installed (detected at runtime from the repo's package.json). Use this skill whenever the user pairs a Figma URL or node-ID with a target repository name — phrases like "build this Figma in [repo]", "implement [figma-link] as a page", "compose this layout", "turn this Figma into a page", "scaffold the design at [link] in [repo]", or any request that combines a Figma reference with a repo name. Trigger even if the user does not say "compose" — pairing a Figma reference with a target repo is the strong signal.
---

# compose-layout

Translate a Figma design into a page-level composition in a target repository, using the design system library that repository already has installed. The work here is **composition, not invention** — prefer the Code Connect mapping where one exists, and use the exact import paths and props it specifies. Where a mapping is missing, fall back: first to a library export resolved by component name, and only if that also fails, to plain HTML elements styled with the library's design tokens. Never create new primitives in the target repo.

For multi-section designs (full-page frames, dashboards, mail layouts, marketing pages — anything with several visually distinct content blocks), **decompose the design into a small set of co-located sub-components plus one assembling page component**. Each sub-component owns one semantic section of the design (header, sidebar, stat card, hero, footer, etc.) and the page component composes them to match the Figma layout. Sub-components written here are page-specific composition shards, **not** primitives — the rule against creating new primitives in the target repo still applies.

## Inputs

You operate on two parameters:

- **figma_link** — a Figma URL, node ID, or selection reference pointing to the design to implement
- **target_repo** — the name or filesystem path of the repository where the implementation should be written

If either parameter is missing, ambiguous, or invalid, stop and ask before proceeding. Do not guess defaults — guessing wastes the user's time and risks writing the file into the wrong place.

## Variable capture

For the canonical scoping rules (env vs. runtime, label vs. placeholder), see [`../CONVENTIONS.md`](../CONVENTIONS.md). The variables this skill uses:

**Skill inputs**, bound on entry:
- `$FIGMA_LINK` ← the **figma_link** parameter (verbatim)
- `$TARGET_REPO` ← the **target_repo** parameter (verbatim)

**Detected in Phase 1**, validated against env:
- `$APERIA_DS_PACKAGE` ← read from `<$TARGET_REPO>/package.json`'s dependencies; the actual import name `$APERIA_DS` is installed under in this target. Must equal `$APERIA_DS` (loaded from `.env`) or be a documented alias of it (e.g. `@<org>/components`). If neither holds, halt — the target is on a different library.

Refer to each variable by `$NAME` in prose; substitute the bound value when emitting code (per CONVENTIONS.md).

## Workflow

Follow these five phases in order. Do not skip ahead — each phase de-risks the next.

### Phase 1: Orient to the target repository

- Navigate to the target repository at the provided path. Verify it exists and is a valid project before doing anything else.
- Read `CLAUDE.md` at the repo root if present. Treat its conventions as authoritative.
- Read `package.json` to:
  - Identify the framework (Next.js, Vite + React, etc.)
  - **Detect the design-system library and bind `$APERIA_DS_PACKAGE`.** Look in `dependencies` for the package matching `$APERIA_DS` (loaded from `.env`) or a documented alias of it (currently: `@shad/components`). Record the exact package name as installed and bind it to `$APERIA_DS_PACKAGE`. If no matching dependency is found in `dependencies` (not just `devDependencies` — the library must be a runtime dep), **halt and report**: the target is on a different library, and the skill must not guess a substitute.
- Inspect one or two existing pages to understand the project's file structure, routing conventions, import patterns, and composition style.
- **Detect the repo's component location and naming convention.** Look for an existing `src/components/`, `components/`, `src/ui/`, or similar directory. Note whether components are stored as flat files (`Foo.tsx`) or as dedicated directories (`Foo/Foo.tsx` + `Foo/index.ts` barrel). Record the pattern. When existing components are present, **strictly match** the detected pattern in Phase 4 — do not introduce a barrel where none exists, and do not flatten a directory layout. If no components directory exists yet, default to a flat `src/components/<ComponentName>.tsx` (no barrel). **When the page-level design will be decomposed (see Phase 2), all sub-components live co-located in the same `<ComponentName>/` directory as the page component** — never scattered across the wider `components/` tree. If the detected convention is flat files (no per-component directory), promote the decomposed page to its own directory and place all sub-components inside it; this is the one case where introducing a directory is correct.
- **Detect the declaration style.** Sample 1–2 existing components and record whether they use `export function Foo` or `export const Foo = () =>`. Match the detected style in Phase 4. If no components exist yet, default to the arrow form: `export const Foo = (...) => {}`.

If the design system library is not installed, or the project structure is incompatible with what the Figma design requires, **stop and report** rather than attempting to proceed. Do not try to install it or work around it.

### Phase 2: Read the Figma design

Use the Figma MCP server to fetch the design referenced by `figma_link`. For every component instance in the design, record:

- Component name
- Variant properties
- Code Connect mapping (if one exists)
- Exact import path and props the mapping specifies

Also capture:

- Layout structure: containers, spacing, alignment, responsive behavior
- **Text content** — capture every text node's exact string verbatim, including casing, punctuation, smart vs straight quotes, and whitespace. Cover headings, labels, button copy, helper text, captions, placeholders, empty-state copy, link text, and any `aria-*` / tooltip strings. Note which strings are real copy vs. placeholders (lorem ipsum, "TODO", "Title here") so Phase 4 doesn't ship placeholders as if they were real copy.

#### Decompose the design into sub-components

Before drafting any props, decide whether the design should be decomposed. Decomposition produces one file per semantic section plus an assembling page — much easier to read, test, and re-use than a single monolithic component. Apply these heuristics:

- **Multi-section page-level frames** — a Figma frame containing several visually distinct sections (header bar + main content + sidebar, hero + features + footer, top-nav + body + right-rail). **Decompose**: one sub-component per section.
- **Figma "Blocks / X" frames** — Figma's naming convention for reusable blocks. Treat each `Blocks / X` frame inside the design as a candidate sub-component named after the block (e.g. `Blocks / Statistic Card` → `StatCard.tsx`).
- **Repeated complex items** — a list of items that each have their own internal structure (4 stat cards, N mail messages, N nav rows, N table rows). **Extract** a single sub-component for the item shape; the page renders the list with `.map()`.
- **Single-card / simple composition** — a design that is one card, one form, one panel with no clear internal sections, or a small primitive arrangement (a labeled input, a card with title + body + button). **Do not decompose**. One file is correct; over-splitting a small component creates noise.

Sub-components live co-located with the page in the same directory (per Phase 1's location rule). A typical decomposed layout looks like:

```
src/components/Dashboard/
  Dashboard.tsx              ← assembles the sub-components
  Dashboard.stories.tsx      ← page-level story
  DashboardHeader.tsx        ← header section (user, nav, search)
  DashboardHeader.stories.tsx
  StatCard.tsx               ← one stat (rendered ×4 by the page)
  StatCard.stories.tsx
  OverviewChart.tsx          ← bar chart card
  OverviewChart.stories.tsx
  RecentSales.tsx            ← recent sales card
  RecentSales.stories.tsx
```

Decomposition is **not** a license to invent new primitives. Each sub-component still composes library primitives (Card, Avatar, Input, Button, Tabs, …) plus plain HTML where appropriate. The page-specific shape lives in the sub-component file; the universal building blocks come from the library.

##### Page assembly pattern — props flow via `React.ComponentProps<typeof Sub>`

The page component exposes **one prop per sub-component instance**, typed by reading the sub-component's own prop shape:

```ts
type DashboardProps = {
  header?: React.ComponentProps<typeof DashboardHeader>
  stats?: React.ComponentProps<typeof StatCard>[]
  chart?: React.ComponentProps<typeof OverviewChart>
  recentSales?: React.ComponentProps<typeof RecentSales>
  className?: string
}
```

This keeps the page's surface narrow (one named slot per section) while letting each sub-component own its own internal prop surface — no prop duplication, no drift. The page renders each sub-component by **spreading the matching prop**:

```tsx
<DashboardHeader {...header} />
{stats?.map((stat, i) => <StatCard key={i} {...stat} />)}
<OverviewChart {...chart} />
<RecentSales {...recentSales} />
```

When a section has no natural key (only one instance, like the chart), the page passes the prop directly. When a section repeats (stats), the page renders an array with `.map()` and an inline `key`. The page's own props (passthrough `className`, top-level layout) sit alongside the section props.

#### Prop candidates

For every interactive or content-bearing node, plan an optional prop. When the design is decomposed, **apply these rules per sub-component** — each sub-component owns the props for its own section, and the page exposes one prop per sub-component instance using `React.ComponentProps<typeof Sub>` (see "Page assembly pattern" above). **At Phase 4, no prop carries a Figma value as its destructure default** — captured Figma values flow to one of two source-of-truth locations decided in Phase 5: the Storybook story's `args` when a story is produced, or the prop's destructure default when Storybook is skipped. The captured value never appears as a hardcoded literal inside JSX. Name props by the **role they play in the layout**, not by Figma layer ID — `title`, `emailLabel`, `emailDescription` are good; `text_18748_247762` is not.

- Every visible text node → optional string prop (e.g. `title`, `description`, `fullNameLabel`, `fullNamePlaceholder`, `emailDescription`, `footerText`). The captured Figma string (preserving casing, punctuation, trailing spaces, smart vs. straight quotes) is recorded in Phase 2 and routed in Phase 5 to one of two locations: the story's `args` when a story is produced (component has no destructure default), or the prop's destructure default when Storybook is skipped.
- Every button → `on<ActionName>Click` callback prop, where `ActionName` is the button's text in PascalCase (e.g. `onCreateAccountClick`, `onSignUpWithGoogleClick`). No default — left `undefined`.
- Every input → `on<FieldName>Change` callback prop. Default to **uncontrolled** (no `value` prop emitted). Set static, design-driven HTML attributes **directly in the JSX (not as props)** — these are determined by the field's role, not by the consumer:
  - `type`: `"email"` for an email field, `"password"` for password, `"search"` for search, `"tel"` for phone, `"url"` for URL, `"number"` for numeric, otherwise `"text"`. Detect the role from the Figma label, placeholder, or layer name.
  - `name`: a role-derived identifier (`name="email"`, `name="password"`, `name="search"`).
  - `autoComplete`: the matching token (`autoComplete="email"`, `"current-password"`, `"new-password"`, `"name"`, `"tel"`, `"off"` for search-style fields).

  Provide an accessible label for every input: if Figma shows a visible label node above or beside the field, render it as a `<label htmlFor={...}>` linked to the input by `id`; if the field is labeled only by placeholder or surrounding copy, apply `aria-label={...}` with the role-named string (taken from the same Figma node — never invented). The consumer wires their own form state if they want controlled inputs.
- **Input + submit-button pairings live inside `<form>`.** When the design shows one or more inputs paired with a button that completes the field's primary action (a "Sign In" button next to an email field, a "Search" button next to a query field), wrap those nodes in a `<form>` element and replace the button's `on<ActionName>Click` prop with `onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void` on the form. This gives users Enter-to-submit, lets browsers and password managers recognize the field grouping, and makes the affordance announceable by assistive tech. The button inside the form is `type="submit"`; sibling buttons that aren't the form's action stay `type="button"` and keep their own `on<ActionName>Click` prop. Do not call `preventDefault` for the consumer — the prop is theirs.
- Every link/anchor → `<linkRole>Href` string prop (e.g. `signUpHref`). The captured URL is routed in Phase 5 like text props — story `args` when a story is produced, destructure default when Storybook is skipped.
- Every image → `<imageRole>Src` and `<imageRole>Alt` props. Captured `src` and `alt` are routed in Phase 5 like text props — story `args` when a story is produced, destructure defaults when Storybook is skipped.
- **Repeated / list-shaped content** (nav rows, table rows, message cards, etc.) → a single array prop typed as `T[]` with a small inline `type` for the element (e.g. `messages?: MailMessage[]`). JSX renders it with optional chaining: `messages?.map(...)`. The captured Figma rows — every row's strings, icons, and badges — are routed in Phase 5: into the story's `args` when a story is produced, or into the prop's destructure default (an inline array literal, or a single `const` declared immediately above the component) when Storybook is skipped.
- The component's root element accepts a `className` passthrough merged onto the outermost container. Standard shadcn convention; useful for consumer layout/positioning overrides.
- **Do not invent props the design does not motivate.** No link in the design → no `href` prop. No image → no `src`/`alt` prop. Props derive from observed Figma nodes only.

#### Resolution tiers

For every component instance, resolve to one of three tiers:

1. **Confirmed** — Code Connect mapping is present; use it as-is.
2. **Inferred** — no mapping, but the component name (case-insensitive) matches a barrel export from `$APERIA_DS_PACKAGE`. Read the actual prop signature from the library source (do not invent props the library does not expose) and record this as inferred.
3. **Improvised** — no mapping and no library export matches. Plan to use a plain HTML element styled with the library's design tokens (`text-foreground`, `bg-background`, semantic Tailwind classes). Never define new tokens locally and never create a new exported primitive in the target repo.

Tier-2 and tier-3 resolutions are not blockers, but they must be surfaced in Phase 3 for explicit user review. The only true blockers at this phase are: the library is not installed, or the design needs a primitive type that does not exist anywhere in the library.

### Phase 3: Produce an inventory and confirm with the user

Before writing any code, present a concise inventory containing:

- Components with **confirmed Code Connect mappings**, listed with their import paths and props
- Components with **inferred library equivalents** (no mapping, but a barrel export matched by name), listed with the inferred import and the prop signature read from the library source — call these out so the user can confirm or correct
- Components that will be **improvised** as plain HTML + library design tokens, with the proposed element and class set
- Any genuine blockers (e.g. the library is not installed, the design needs a primitive type that does not exist anywhere) — these still halt the run
- **Decomposition plan** — when the design is being decomposed (per Phase 2), list every sub-component with:
  - Sub-component name (PascalCased, descriptive of the section — e.g. `DashboardHeader`, `StatCard`, `OverviewChart`)
  - Co-located file path (`<ComponentName>/<SubName>.tsx`)
  - Which Figma section / `Blocks / X` frame it maps to
  - Whether it is rendered once or as a list (`.map()`) from the page
  - Its own `type <SubName>Props` block in full
  When the design is **not** decomposed (single-card / simple composition), state that explicitly and skip this item.
- **Page assembly plan** — the page component's `type <PageName>Props` block, exposing one prop per sub-component instance via `React.ComponentProps<typeof Sub>` (or `React.ComponentProps<typeof Sub>[]` for repeated items), plus any page-level props (`className`, top-level layout slots). Show the JSX snippet that assembles the sub-components in the order they appear in the Figma frame.
- **Proposed props** — the generated `type FooProps` block(s) in full. For a non-decomposed design this is a single block; for a decomposed design this is one block per sub-component plus the page's assembly block (covered by the two bullets above). Show the captured Figma value next to each text/href/image/array prop so the user sees where it will land — in the Storybook story's `args` if Phase 5 produces a story, or in the prop's destructure default if Storybook is skipped. The user can rename, drop, or extend props at this checkpoint — it is far cheaper to adjust the prop surface here than after the file is written. Treat props as a confirmable inventory item, on par with the component name and path.
- **The proposed output file(s)** — when decomposed, the inventory lists every file that will be written (each sub-component + the page); when not decomposed, a single component file. In both cases, include:
  - A proposed component name (derived from the Figma frame name, PascalCased)
  - A proposed file path that matches the repo's existing component-location convention detected in Phase 1
  - An explicit note that the skill must never merge the design into `App.tsx`, `main.tsx`, `index.tsx`, `app/page.tsx`, `pages/_app.*`, or any other entry-point/router file
  - **Existing-file check** — before presenting the inventory, test whether a file already exists at **any** of the proposed paths (page **and** every sub-component). For each existing file, surface that fact prominently in the inventory and ask the user to choose per-file:
    - **Replace** — overwrite the existing file with the freshly composed output, discarding its current contents
    - **Update** — edit the existing file in place to bring it in line with the new Figma design, preserving any handwritten logic outside the parts the design dictates (event handlers, state, callbacks, data wiring)
    - **Write to a different path** — supply an alternative path, in which case the new path is the one to check for conflicts and the existing file is left untouched

    Never overwrite or update silently. Do not assume one option over another based on apparent code quality — wait for an explicit choice. When several proposed files conflict, ask once with a per-file selection rather than bundling them under a single Replace/Update.
- Any ambiguous layout or composition decisions that need resolving

Wait for the user to confirm or correct this inventory — including the proposed component name and path — before implementing. Treat this as a hard checkpoint, not a courtesy.

This checkpoint exists specifically to catch errors early. It is far cheaper to fix a wrong path, a missing mapping, or a misread Figma section here than after a file is written. Do not skip it, even if the design looks straightforward.

### Phase 4: Implement and verify

Once the inventory is confirmed:

- **For decomposed designs, write each sub-component file first, then write the page component last** so the page's relative imports resolve against files that already exist. Each sub-component is a standalone file with its own `type <SubName>Props` block, its own declaration (matching the style detected in Phase 1), its own `className` passthrough, and its own imports from `$APERIA_DS_PACKAGE` / lucide / plain HTML per the tiers resolved in Phase 2.
- **The page component** imports each sub-component from its co-located relative path (`./DashboardHeader`, `./StatCard`, …), declares its own props as one slot per sub-component instance using `React.ComponentProps<typeof Sub>` (and `[]` for repeated items), and renders the assembly by spreading the matching prop onto each sub-component. Use `.map()` with an inline `key` for repeated items.
- For each file, honor the user's Phase 3 choice:
  - **New file** (no prior conflict) — create the file fresh with the fully composed output.
  - **Replace** — overwrite the existing file at the path with the fully composed output. Do not attempt to preserve any of the prior contents.
  - **Update** — edit the existing file in place. Apply the structural, layout, and styling changes the new design requires, but preserve handwritten logic that the design does not dictate (event handlers, props, state, hooks, callbacks, data wiring, comments). Use targeted edits (Edit tool, not Write) so unrelated code is not disturbed. If a clean update is impossible (e.g. the existing file's structure is incompatible with the new design), stop and tell the user — do not silently fall back to Replace.
- In all cases, do not edit, append to, or otherwise modify entry-point files (`App.tsx`, `main.tsx`, `index.tsx`, `app/page.tsx`, `pages/_app.*`, router config, etc.). Wiring the new component into the app is out of scope for this skill — the user will import it themselves.
- Implement each component instance per the tier resolved in Phase 2: confirmed mappings use the exact import path and props from Code Connect; inferred mappings use the library export resolved by name with the prop signature read from source; improvised cases use plain HTML elements styled with library design tokens
- Compose the layout to match the Figma structure
- **Render every Figma text node with its exact string** — do not paraphrase, abbreviate, sentence-case a Figma title, or substitute placeholder copy ("Button", "Label", lorem ipsum) when Figma has real copy. Preserve punctuation, casing, and quote style. Text supplied via props (`title`, `label`, `placeholder`, `aria-label`) counts. The JSX always consumes the prop variable directly — never a hardcoded literal. Phase 5 then routes the verbatim string into either the story's `args` (story produced) or the prop's destructure default (Storybook skipped); at Phase 4 the slot renders empty until that routing happens.
- Use the library's design tokens — semantic Tailwind classes like `bg-primary` and `text-muted-foreground` — rather than raw colors or pixel values
- **Component shape.** Use the declaration style detected in Phase 1; default to an arrow function when none is detected:
  - Declare `type <ComponentName>Props = { ... }` directly above the component. Every auto-generated prop is optional (`?:`). No `interface`, no `IFooProps` prefix, no `Readonly<>` wrapper.
  - Declare the component as `export const <ComponentName> = ({ ... }: <ComponentName>Props) => { ... }`. No `import React`; rely on the project's JSX runtime (`"jsx": "react-jsx"` or equivalent).
  - Destructure props **without defaults at this stage** — e.g. `({ title, onCreateAccountClick, className }: CreateAccountCardProps) =>`. Phase 5 backfills the captured Figma values: into the story's `args` when a story is produced (destructure stays default-free), or into the destructure defaults themselves when Storybook is skipped.
  - Apply the `className` passthrough to the root element. If the library exposes a class merger (e.g. `cn` from `aperia-ds5`) use it; otherwise template-string concat: `` `existing-classes ${className ?? ''}` ``.
  - Wire each prop to the right JSX slot: text props replace the literal Figma string in the JSX; callback props attach to the matching event (`onClick`, `onChange`); href props attach to `<a>` elements; etc.
  - When a prior Phase 2 step identified an input + submit-button pairing, the JSX wrapper for those nodes is `<form onSubmit={...}>`, not `<div>`, and the submit button carries `type="submit"`.
  - **Heading tags reflect the composition's role in a document, not Figma's typography.** The page-level composition's primary title is `<h1>`. When the design is decomposed, each sub-component's own section heading is `<h2>` (because the page that assembles them owns the `<h1>`); deeper nested headings step down to `<h3>` / `<h4>`. Do not copy Figma's font-size hierarchy onto the tag — Figma styles `<h1>`-sized text with CSS, but the HTML tag drives the accessibility tree and document outline. A standalone single-card composition (no parent page) is also `<h1>` for its title.
  - **Array / list props are read with optional chaining** — `messages?.map(...)`, `navItems?.map(...)` — so the component degrades to an empty list when no data is supplied. At Phase 4, do not seed list data with module-level constants or destructure defaults; Phase 5 will route the captured Figma rows into the story's `args` (if a story is produced) or into the prop's destructure default — an inline array literal, or a single `const <ArrayName>: <ElementType>[] = [...]` declared immediately above the component when the array is too large to read inline (if Storybook is skipped).

#### Worked example — the output shape

This example shows the **with-Storybook shape** of a small two-file decomposition: a `StatCard` sub-component for the repeated stat-card section, and a `Dashboard` page component that composes a list of them. Each file declares props with no defaults; every Figma-derived string lives in the matching story's `args` (last code block). The **no-Storybook shape** for the same component (when the user declines Storybook in Phase 5) keeps the JSX and types identical but carries each Figma value as a destructure default on its matching prop — see the Phase 5 "skip" branch for the exact backfill.

For a single-card / simple design that should **not** be decomposed (per Phase 2), the same patterns apply to one file: one `type FooProps`, one `export function Foo(...)`, one story carrying every Figma string in `args`. No sub-components, no `React.ComponentProps<typeof Sub>` slots — just the single file. Phase 2 decides which shape applies.

**Sub-component file — `Dashboard/StatCard.tsx`** (`$APERIA_DS_PACKAGE` is substituted at emit time — see `../CONVENTIONS.md`):

```tsx
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '$APERIA_DS_PACKAGE'

type StatCardProps = {
  label?: string
  value?: string
  change?: string
  icon?: React.ReactNode
  className?: string
}

export const StatCard = ({ label, value, change, icon, className }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <CardAction className="text-muted-foreground">{icon}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  )
}
```

**Page component — `Dashboard/Dashboard.tsx`:**

```tsx
import { DashboardHeader } from './DashboardHeader'
import { OverviewChart } from './OverviewChart'
import { RecentSales } from './RecentSales'
import { StatCard } from './StatCard'

type DashboardProps = {
  header?: React.ComponentProps<typeof DashboardHeader>
  stats?: React.ComponentProps<typeof StatCard>[]
  chart?: React.ComponentProps<typeof OverviewChart>
  recentSales?: React.ComponentProps<typeof RecentSales>
  className?: string
}

export const Dashboard = ({ header, stats, chart, recentSales, className }: DashboardProps) => {
  return (
    <div className={`flex flex-col w-full bg-background text-foreground ${className ?? ''}`}>
      <DashboardHeader {...header} />
      <div className="flex flex-col gap-4 px-8 py-6">
        <div className="flex items-center gap-4">
          {stats?.map((stat, i) => (
            <StatCard key={i} {...stat} className="flex-1 min-w-0" />
          ))}
        </div>
        <div className="flex h-[490px] items-start gap-4">
          <OverviewChart {...chart} className="flex-1 min-w-0 self-stretch" />
          <RecentSales {...recentSales} className="flex-1 min-w-0 self-stretch" />
        </div>
      </div>
    </div>
  )
}
```

The page's prop type is **narrow** — one slot per section. The sub-components own their own internal prop surfaces, so changes to (say) `StatCard`'s props automatically flow into `DashboardProps['stats']` via `React.ComponentProps<typeof StatCard>` with no duplication.

**Story — `Dashboard/Dashboard.stories.tsx`:** every Figma value lives in `args`, nested by section to mirror the page's prop shape. Icons and any other React-node values are imported and constructed in the story, never in the component.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react'
import { Dashboard } from './Dashboard'

const meta = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Dashboard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    header: {
      userName: 'Alicia Koch',
      navItems: [{ label: 'Overview', active: true }, { label: 'Customers' }],
      searchPlaceholder: 'Placeholder',
    },
    stats: [
      { label: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: <DollarSign className="size-4" /> },
      { label: 'Subscriptions', value: '+2350', change: '+180.1% from last month', icon: <Users className="size-4" /> },
      { label: 'Sales', value: '+12,234', change: '+19% from last month', icon: <CreditCard className="size-4" /> },
      { label: 'Active Now', value: '+573', change: '+201 since last hour', icon: <Activity className="size-4" /> },
    ],
    chart: { title: 'Overview', data: [{ month: 'Jan', heightPercent: 36 }, /* … */] },
    recentSales: { title: 'Recent Sales', description: 'You made 265 sales this month.', sales: [/* … */] },
  },
}
```

Each sub-component also gets its own story (e.g. `StatCard.stories.tsx`) when Phase 5 is opted into — useful for isolating section work and for design verification per block.

- Verify imports resolve against the installed library
- Report what was done: file path, components used, any assumptions made

### Phase 5: Offer a Storybook story

After the component file(s) are written and verified, ask the user whether they would like Storybook stories scaffolded. Do not generate stories automatically — wait for explicit confirmation, since not every target repo uses Storybook and the user may want to defer or skip it.

When prompting:

- Check whether the target repo has Storybook installed (look for `@storybook/*` in `package.json` or a `.storybook/` directory). Mention what you found so the user can make an informed call.
- Propose story file paths that follow the repo's existing story conventions (e.g. co-located `*.stories.tsx` next to each component, or under a `stories/` directory — match what the repo already does).
- For decomposed designs, the default offer is **one story per file** (each sub-component + the page) — sub-component stories are useful for isolating section work and for design verification per block. Mention this in the question so the user knows the scope, and let them opt for "page only" or "skip" if they prefer.
- For non-decomposed designs, ask the single-component version: "Would you like me to create a Storybook story for this component?"

If the user confirms:

- Write a story file that **carries every Figma value as `args` on the default story** — text strings, hrefs, image `src`/`alt` pairs, and any array data captured in Phase 2. The default story exists specifically because the component has no built-in defaults; without `args`, the component renders empty slots. When a variant story diverges (error state, alternate copy, empty data), override the relevant entries in `args` rather than duplicating the JSX.
- For decomposed designs:
  - Each sub-component's story populates only **that section's** props with the Figma values for that section. Title each sub-component story as `Components/<PageName>/<SubName>` (e.g. `Components/Dashboard/StatCard`) so they group together in Storybook's sidebar.
  - The **page story** populates **nested** args matching the page's prop shape — `args: { header: { ... }, stats: [...], chart: { ... }, recentSales: { ... } }` — re-using the same Figma values that appeared in the sub-component stories. Title it as `Components/<PageName>` (e.g. `Components/Dashboard`).
- For **array / list data** (nav rows, message cards, table rows, etc.), construct the array literal inside the story file. Any React-node values within those items — icons, badges, custom render slots — are imported and referenced from the **story**, not the component. Example: if the component renders `inboxNavItems?.map(item => <>{item.icon} {item.label}</>)`, the story imports the icons from `lucide-react` and builds `inboxNavItems: [{ label: 'Inbox', icon: <Inbox className="size-4" />, count: '128' }, ...]` directly in `args`.
- **Match the Storybook `layout` parameter to the Figma frame's sizing intent — do not copy it from a sibling story.** Read the design context returned by `get_design_context` for the Figma frame:
  - **Fluid / fill-parent layouts** — frames that emit `size-full`, `content-stretch`, `flex-1`, or whose root element spans via `w-full` — use `layout: "padded"` (gives canvas padding while letting the component stretch) or `layout: "fullscreen"` (no padding). `layout: "centered"` will shrink Storybook's canvas to content, and `w-full` will have no room to span into.
  - **Fixed-dimension compositions** — frames that emit explicit `w-[Npx] h-[Npx]` and contain no fluid children — use `layout: "centered"`.
  - When unsure, default to `"padded"` and note the choice in the closing summary so the user can correct it.
- Include a story per meaningful variant or state visible in the Figma design (e.g. empty, loaded, error) when the data clearly supports it; otherwise stick to a single default story.
- Use the same design system imports and design tokens as the component itself — do not introduce new primitives in the story.
- Report the story file path when done.

If the user declines or asks to skip Storybook, **before stopping**, edit each just-written component file to thread the Phase 2 captures into the prop destructure as defaults. The component must render the design's content on its own when imported with no consumer props. For every prop derived from a Figma value:

- **Text props** receive their captured string verbatim — preserve casing, punctuation, smart vs straight quotes, and trailing whitespace exactly as Phase 2 recorded them.
- **Href props and image `Src` / `Alt` props** receive their captured URLs / strings.
- **Array / list props** receive the captured rows. Write them as an inline array literal in the destructure when the array is small and contains only string/number values; otherwise write a single `const <ArrayName>: <ElementType>[] = [...]` declared immediately above the component and reference it as the default (`messages = DEFAULT_MESSAGES`). Use the `const`-above form whenever rows have 10+ entries or carry embedded React-node values (icons, badges) so the destructure stays readable.
- **React-node values inside array rows** (e.g. `lucide-react` icons) are imported at the top of the component file. This is the one case where the component file owns icon imports the design needs — they're no longer hoisted to the story because there is no story.

Apply these edits in place with the `Edit` tool — do not rewrite the file from scratch. Callback props (`on<ActionName>Click`, `on<FieldName>Change`) and `className` keep no default, since Figma never captured a value for them. Once the defaults are in, stop cleanly without writing anything further.

In the closing summary, mention that the user can optionally run `/verify-design <figma-link> <component-path>` to get a fidelity report against the Figma source. Do not invoke that verification yourself — leave it to the user to decide.

## Operating rules

These rules exist because this skill operates on a *target* repo while the design system is owned and centralized elsewhere. Local detours in the target repo create drift between the two and are very expensive to clean up later.

- **Never create new primitive components in the target repository.** Primitives are universal building blocks (Button, Card, Input, Avatar, Tabs, Dialog, DropdownMenu, …) and they come from the installed library. **Sub-components produced by decomposition are different** — they are page-specific composition shards (e.g. `DashboardHeader`, `StatCard`, `OverviewChart`) that *compose* library primitives to render one section of the design, and they are an expected output of this skill. They are not primitives and the rule against creating primitives does not block them. When the library is missing a primitive but the design only needs a simple element (separator, container, text wrapper, etc.), use plain HTML styled with the library's design tokens — that is the tier-3 fallback. When the design needs a complex primitive the library does not expose (e.g. Card, Dialog, DropdownMenu), stop and surface this as a library gap rather than building it locally.
- **Never run `shadcn add`** or any command that bypasses the centralized library.
- **Never redefine CSS variables, colors, or design tokens locally** in the target repository. Tokens live in the library.
- **Never invent component APIs.** When Code Connect provides a mapping, use the exact props shown. When it does not, derive props from the library's actual exports — do not pass props the library does not declare.
- **Never import from deep paths inside the library's build output** — use the library's root export only.
- **Never modify the design system library itself** from this workflow. You operate only on the target repository.
- **Never modify entry-point or router files.** The skill's only file outputs are the page component plus its co-located sub-components (when decomposed) — each created fresh, replaced wholesale, or updated in place per the user's Phase 3 choice — plus optionally Storybook stories if the user opts in during Phase 5. Importing or rendering the new component anywhere else is the user's responsibility.
- **Never hardcode swappable values inside JSX.** Text, href, image, and array props are always consumed from the destructure — never written as literal strings or arrays inline in JSX. Where those captured Figma values *land* is decided in Phase 5: the Storybook story's `args` when a story is produced (component has no destructure defaults), or the prop's destructure default (with arrays as an inline literal or a single `const` declared immediately above the component) when Storybook is skipped. Do not pre-emptively declare module-level constants or destructure defaults at Phase 4 — Phase 5's branch is the only place those get introduced, and only on the skip path.
- **Never invent props the design does not motivate.** If the Figma has no link, do not add `signUpHref`. If it has no image, do not add `imageSrc`. Props derive from observed Figma nodes only.

## When to stop and escalate

Stop and ask the user when:

- A Figma component has no Code Connect mapping, no library export matched by name, and no plain-HTML fallback that fits (i.e. the design needs a primitive type the library does not expose)
- The target repository does not have the required library installed
- The project's conventions conflict with what Code Connect suggests
- The target output path is ambiguous (an existing-file conflict at the proposed path is handled interactively in Phase 3 — Replace / Update / new path — not by halting)
- The design implies business logic (auth, data fetching, form submission, routing) that exceeds layout composition
- The repo has no `components/` directory and the user has not specified where the new file should go (propose a default and confirm rather than guessing silently)

## Scope

This skill is intentionally narrow: translate Figma designs into page-level compositions using an existing, installed component library.

You do **not**:

- Refactor unrelated code
- Set up project infrastructure
- Modify the design system
- Add primitives

Discover project conventions at runtime — do not assume them. **Prefer** Code Connect as the source of Figma-to-code mapping; fall back to the library's actual exports when no mapping exists. When in doubt, **stop and ask** rather than proceed with a guess.
