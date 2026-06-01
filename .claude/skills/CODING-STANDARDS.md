# Coding Standards

Source of truth for code style and best practices for code emitted by skills in this directory, and a checklist for vetting existing repos. The primary goal is that implement-design output stays consistent across developers — different people running the skill should produce code that looks like it came from the same author.

## How to use

- **Skills emitting code** follow these rules. When a skill's own `SKILL.md` conflicts, the skill wins (it has more local context) — open a PR to reconcile.
- **AI reviewers** walk through sections A–J when auditing an existing repo, flagging violations with `file:line` and the rule (e.g. `Foo.tsx:14 — B.8 invented href prop`).
- For skill-authoring rules (variable binding, `$NAME` substitution), see [`./CONVENTIONS.md`](./CONVENTIONS.md) — different concern, both docs are in force.

## A. Component structure (React/TS)

- **A.1** Props declared as `type FooProps = { ... }` directly above the component — not `interface`, not `IFooProps` prefix, not `Readonly<>` wrapper.
- **A.2** All auto-generated props optional (`?:`). Required props only when the design genuinely demands them.
- **A.3** `export const Foo = ({ ... }: FooProps) => { ... }` arrow form by default. Match the repo's detected declaration style if different.
- **A.4** No `import React` — rely on the JSX runtime (`"jsx": "react-jsx"`).
- **A.5** `className` passthrough on the root element via `cn()` if the library exposes one, else template-string concat: `` `existing-classes ${className ?? ''}` ``.

## B. Props derived from designs (implement-design primary contract)

- **B.1** Every visible text node → optional string prop named by **role**, not Figma layer ID. `title`, `emailLabel`, `emailDescription` — good. `text_18748_247762` — not.
- **B.2** Every button → `on<ActionName>Click` callback prop, where `ActionName` is the button's text in PascalCase (`onCreateAccountClick`, `onSignUpWithGoogleClick`). No default.
- **B.3** Every input → `on<FieldName>Change` callback. Uncontrolled by default (no `value` prop). Static, design-driven HTML attributes (`type`, `name`, `autoComplete`) set directly in JSX, not as props.
- **B.4** Input + submit-button pairings → wrap in `<form onSubmit={...}>`. Submit button is `type="submit"`; sibling buttons stay `type="button"` with their own `on<ActionName>Click`. Do not call `preventDefault` for the consumer.
- **B.5** Every link/anchor → `<linkRole>Href` string prop (e.g. `signUpHref`).
- **B.6** Every image → `<imageRole>Src` and `<imageRole>Alt` props.
- **B.7** Repeated/list-shaped content → single array prop typed as `T[]` with a small inline `type` for the element. Render with `items?.map(...)` and an inline `key`.
- **B.8** Never invent props the design does not motivate. No link in the design → no `href` prop. No image → no `src`/`alt` prop.

## C. JSX content rules

- **C.1** Never hardcode Figma values inside JSX (text, hrefs, image src/alt, array literals). JSX consumes prop variables; captured values land in story `args` (Storybook path) or destructure defaults (skip-Storybook path) — never as literals inline.
- **C.2** Render Figma text **verbatim** — preserve casing, punctuation, smart vs straight quotes, trailing whitespace. Do not paraphrase or sentence-case a Figma title. Do not substitute placeholder copy ("Button", "Label", lorem ipsum) when Figma has real copy.
- **C.3** Heading hierarchy reflects the composition's role in a document, **not** Figma typography. Page-level title → `<h1>`. Decomposed sub-component section heading → `<h2>` (the page owns the `<h1>`). Deeper nested → `<h3>`, `<h4>`. A standalone single-card composition is `<h1>` for its title.
- **C.4** Array/list props read with optional chaining: `messages?.map(...)`, `navItems?.map(...)` — component degrades to empty list when no data is supplied.

## D. Styling — Tailwind v4 + aperia-ds5

- **D.1** Use semantic Tailwind classes — `bg-primary`, `text-muted-foreground`, `text-sm font-medium`. The library exposes these via its token CSS; they map to design-system variables, not literal colors.
- **D.2** No raw colors, no off-token pixel values inside the component. Avoid `bg-[#aabbcc]`, `w-[247px]`, etc., unless the value is a genuine design-driven layout dimension (a Figma-fixed card width is fine; a one-off color hex is not).
- **D.3** No locally redefined tokens, CSS variables, or design colors in the target repo. Tokens live in the library.
- **D.4** No `shadcn add`, no commands that bypass the centralized library. A missing primitive is a library gap to surface, not a local fix.
- **D.5** Consumer's `globals.css` must include `@source "../node_modules/aperia-ds5/dist"` (path adjusted per consumer's CSS location). Without it, library-only Tailwind classes (e.g. `text-primary-foreground`) never get emitted.

## E. Imports

- **E.1** Import library primitives from the library root only — never deep paths into build output (no `aperia-ds5/dist/components/button`).
- **E.2** Prefer Code Connect mappings when present. Use the exact import path and props the mapping specifies.
- **E.3** No mapping → fall back to library barrel export by component name (case-insensitive). Verify the actual prop signature in the library source; do not invent props the library does not declare.
- **E.4** No barrel match either → fall back to plain HTML styled with library design tokens (tier-3 improvisation). Never create a new exported primitive in the target repo.

## F. File structure

- **F.1** Single-file default for simple compositions — one card, one form, one panel with no clear internal sections.
- **F.2** Decompose multi-section designs into one sub-component per semantic section (header, sidebar, stat card, hero, footer). Repeated complex items also extract to a single sub-component rendered with `.map()`.
- **F.3** Sub-components live co-located with the page in the same `<ComponentName>/` directory. Never scattered across the wider `components/` tree.
- **F.4** Page component imports each sub via relative path. Type its props as one slot per sub-component instance using `React.ComponentProps<typeof Sub>` (and `[]` for repeated items). Render by spreading the matching prop onto each sub-component.
- **F.5** Never modify entry-point files: `App.tsx`, `main.tsx`, `index.tsx`, `app/page.tsx`, `pages/_app.*`, router config. Wiring the new component into the app is the user's job.
- **F.6** Match the repo's existing component-location convention (flat file vs directory + barrel). When the page is decomposed and the repo's convention is flat, promote the decomposed page to its own directory — this is the one case where introducing a directory overrides the convention.

## G. Accessibility

- **G.1** Every input has an accessible label. If the design shows a visible label, render `<label htmlFor={id}>` linked to the input by `id`. If labeled only by placeholder or surrounding copy, apply `aria-label={...}` with the role-named string (taken from the same Figma node, not invented).
- **G.2** Images have meaningful `alt` text from the design. Decorative-only images use `alt=""`.
- **G.3** Use semantic HTML: `<button>` for actions, `<a>` for navigation, `<form>` for input-submit pairings. Don't render a `<div>` with an `onClick` when a real interactive element fits.
- **G.4** Heading hierarchy follows document role (see C.3) — drives the screen-reader outline.

## H. TypeScript

- **H.1** No `any`. Use `unknown` and narrow with type guards, or proper generics.
- **H.2** Prefer `type` over `interface` for prop declarations (consistent with A.1).
- **H.3** React-node values the component renders (icons, badges) flow in via props or array items. They are constructed in the story (Storybook path) or declared above the component (skip-Storybook path) — never inside the component's JSX.

## I. General code hygiene

- **I.1** Naming: `PascalCase` components, `camelCase` functions and variables, `SCREAMING_SNAKE` for env vars and module-level constants.
- **I.2** No commented-out code. No dead code. No `TODO` without an owner and a ticket reference.
- **I.3** Comments only when the WHY is non-obvious — a hidden constraint, a subtle invariant, a workaround for a known bug. Don't restate what the code does; named identifiers do that already.
- **I.4** No premature abstraction. Three similar lines is better than a bad helper. Don't design for hypothetical future requirements.
- **I.5** Error handling at system boundaries (user input, external APIs) — trust internal code and framework guarantees.
- **I.6** Keep files focused. If a single component file passes ~400 lines, consider decomposing per §F.2.

## J. Hard rules — NEVER

- **J.1** Never hardcode user-specific filesystem paths in shared files (`C:\Users\Joel\...`). Use repo-relative paths.
- **J.2** Never modify the design system library itself from a skill run. Skills operate only on the target repo.
- **J.3** Never create new primitives in the target repo. Sub-components from decomposition are page-specific composition shards — they are not primitives, but they may not be used as building blocks elsewhere.
- **J.4** Never redefine CSS variables, colors, or design tokens locally in the target repo.
- **J.5** Never invent component APIs not declared by the library or its Code Connect mapping.
- **J.6** Never `--no-verify` git hooks or skip signing without explicit user request.

## Vetting an existing repo

When auditing, produce a report grouped by section:

1. **Section J violations are blocking** — surface them first, before anything else.
2. Walk A–I and list each violation as `file:line — rule N.M — short description`. Example: `Dashboard.tsx:42 — B.8 — invented loginHref prop; design has no link`.
3. For each violation, note which kind it is:
   - **(a) hard rule break** — must fix.
   - **(b) repo-convention inconsistency** — file diverges from the repo's own detected pattern; fix unless the repo's convention is the wrong one.
   - **(c) judgment call** — the rule could reasonably be waived for this case; surface with rationale and let the human decide.
4. Close with a summary count: `N blocking, M hard breaks, P inconsistencies, Q judgment calls`.

If a rule cannot be evaluated from a file alone (requires runtime, design source, etc.), say so — do not skip it silently.
