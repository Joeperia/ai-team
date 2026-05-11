---
name: compose-layout
description: Implement a Figma design as a page or layout in a target repository, using whatever design system component library the target repo has installed (detected at runtime from the repo's package.json). Use this skill whenever the user pairs a Figma URL or node-ID with a target repository name — phrases like "build this Figma in [repo]", "implement [figma-link] as a page", "compose this layout", "turn this Figma into a page", "scaffold the design at [link] in [repo]", or any request that combines a Figma reference with a repo name. Trigger even if the user does not say "compose" — pairing a Figma reference with a target repo is the strong signal.
---

# compose-layout

Translate a Figma design into a page-level composition in a target repository, using the design system library that repository already has installed. The work here is **composition, not invention** — prefer the Code Connect mapping where one exists, and use the exact import paths and props it specifies. Where a mapping is missing, fall back: first to a library export resolved by component name, and only if that also fails, to plain HTML elements styled with the library's design tokens. Never create new primitives in the target repo.

## Inputs

You operate on two parameters:

- **figma_link** — a Figma URL, node ID, or selection reference pointing to the design to implement
- **target_repo** — the name or filesystem path of the repository where the implementation should be written

If either parameter is missing, ambiguous, or invalid, stop and ask before proceeding. Do not guess defaults — guessing wastes the user's time and risks writing the file into the wrong place.

## Variable capture

As soon as the skill is invoked, bind the inputs to in-memory variables and refer to them by these names for the rest of the run (and in any artifacts you produce — notes, prompts, eval records, etc.):

- `$FIGMA_LINK` ← the **figma_link** parameter (verbatim)
- `$TARGET_REPO` ← the **target_repo** parameter (verbatim)
- `$TARGET_REPO_PACKAGE` ← derived in Phase 1: the **exact** internal scoped dependency name read from `$TARGET_REPO/package.json` (e.g. `@<org>/components`). Bind this once and reuse it everywhere a primitive import path is needed.

These variable names are the canonical way other shared artifacts (agent definitions, command examples, eval notes) refer back to a compose-layout run. When you see `$TARGET_REPO` or `$TARGET_REPO_PACKAGE` elsewhere in the project, it points to the values captured here.

Other related variables, populated from the environment rather than from skill inputs:

- `$APERIA_DS` (in `.env`) names the centralized design-system library that target repos consume. It is environment configuration, not a per-invocation parameter. The library's npm import name as installed in any specific target repo is detected at runtime by Phase 1 (read from `$TARGET_REPO/package.json` and bound to `$TARGET_REPO_PACKAGE`) — do not look it up from env.

## Workflow

Follow these five phases in order. Do not skip ahead — each phase de-risks the next.

### Phase 1: Orient to the target repository

- Navigate to the target repository at the provided path. Verify it exists and is a valid project before doing anything else.
- Read `CLAUDE.md` at the repo root if present. Treat its conventions as authoritative.
- Read `package.json` to:
  - Identify the framework (Next.js, Vite + React, etc.)
  - **Detect the design system library.** Look for an internal scoped dependency that the team owns — e.g. `@shad/components`, `@<org>/components`, `@<org>/ui`, `@<org>/design-system`. Record its **exact** package name from `package.json`. This is the library you will import from. The team's library name will change over time, so do not hardcode a name anywhere — derive it from `package.json` every single run.
  - Confirm the library is actually installed (present in `dependencies` or `devDependencies`).
- Inspect one or two existing pages to understand the project's file structure, routing conventions, import patterns, and composition style.
- **Detect the repo's component location and naming convention.** Look for an existing `src/components/`, `components/`, `src/ui/`, or similar directory. Note whether components are stored as flat files (`Foo.tsx`) or as dedicated directories (`Foo/Foo.tsx` + `Foo/index.ts` barrel). Record the pattern. If no components directory exists yet, default to creating `src/components/<ComponentName>/<ComponentName>.tsx` with an `index.ts` barrel re-export.

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

For every component instance, resolve to one of three tiers:

1. **Confirmed** — Code Connect mapping is present; use it as-is.
2. **Inferred** — no mapping, but the component name (case-insensitive) matches a barrel export from `$TARGET_REPO_PACKAGE`. Read the actual prop signature from the library source (do not invent props the library does not expose) and record this as inferred.
3. **Improvised** — no mapping and no library export matches. Plan to use a plain HTML element styled with the library's design tokens (`text-foreground`, `bg-background`, semantic Tailwind classes). Never define new tokens locally and never create a new exported primitive in the target repo.

Tier-2 and tier-3 resolutions are not blockers, but they must be surfaced in Phase 3 for explicit user review. The only true blockers at this phase are: the library is not installed, or the design needs a primitive type that does not exist anywhere in the library.

### Phase 3: Produce an inventory and confirm with the user

Before writing any code, present a concise inventory containing:

- Components with **confirmed Code Connect mappings**, listed with their import paths and props
- Components with **inferred library equivalents** (no mapping, but a barrel export matched by name), listed with the inferred import and the prop signature read from the library source — call these out so the user can confirm or correct
- Components that will be **improvised** as plain HTML + library design tokens, with the proposed element and class set
- Any genuine blockers (e.g. the library is not installed, the design needs a primitive type that does not exist anywhere) — these still halt the run
- **The proposed output file** — a standalone, importable component file. Include:
  - A proposed component name (derived from the Figma frame name, PascalCased)
  - A proposed file path that matches the repo's existing component-location convention detected in Phase 1
  - An explicit note that the skill must never merge the design into `App.tsx`, `main.tsx`, `index.tsx`, `app/page.tsx`, `pages/_app.*`, or any other entry-point/router file
  - **Existing-file check** — before presenting the inventory, test whether a file already exists at the proposed path. If it does, surface that fact prominently in the inventory and ask the user to choose:
    - **Replace** — overwrite the existing file with the freshly composed output, discarding its current contents
    - **Update** — edit the existing file in place to bring it in line with the new Figma design, preserving any handwritten logic outside the parts the design dictates (event handlers, state, callbacks, data wiring)
    - **Write to a different path** — supply an alternative path, in which case the new path is the one to check for conflicts and the existing file is left untouched

    Never overwrite or update silently. Do not assume one option over another based on apparent code quality — wait for an explicit choice.
- Any ambiguous layout or composition decisions that need resolving

Wait for the user to confirm or correct this inventory — including the proposed component name and path — before implementing. Treat this as a hard checkpoint, not a courtesy.

This checkpoint exists specifically to catch errors early. It is far cheaper to fix a wrong path, a missing mapping, or a misread Figma section here than after a file is written. Do not skip it, even if the design looks straightforward.

### Phase 4: Implement and verify

Once the inventory is confirmed:

- Write the component at the confirmed path, honoring the user's Phase 3 choice:
  - **New file** (no prior conflict) — create the file fresh with the fully composed output.
  - **Replace** — overwrite the existing file at the path with the fully composed output. Do not attempt to preserve any of the prior contents.
  - **Update** — edit the existing file in place. Apply the structural, layout, and styling changes the new design requires, but preserve handwritten logic that the design does not dictate (event handlers, props, state, hooks, callbacks, data wiring, comments). Use targeted edits (Edit tool, not Write) so unrelated code is not disturbed. If a clean update is impossible (e.g. the existing file's structure is incompatible with the new design), stop and tell the user — do not silently fall back to Replace.
- In all cases, do not edit, append to, or otherwise modify entry-point files (`App.tsx`, `main.tsx`, `index.tsx`, `app/page.tsx`, `pages/_app.*`, router config, etc.). Wiring the new component into the app is out of scope for this skill — the user will import it themselves.
- Implement each component instance per the tier resolved in Phase 2: confirmed mappings use the exact import path and props from Code Connect; inferred mappings use the library export resolved by name with the prop signature read from source; improvised cases use plain HTML elements styled with library design tokens
- Compose the layout to match the Figma structure
- **Render every Figma text node with its exact string** — do not paraphrase, abbreviate, sentence-case a Figma title, or substitute placeholder copy ("Button", "Label", lorem ipsum) when Figma has real copy. Preserve punctuation, casing, and quote style. Text supplied via props (`title`, `label`, `placeholder`, `aria-label`) counts.
- Use the library's design tokens — semantic Tailwind classes like `bg-primary` and `text-muted-foreground` — rather than raw colors or pixel values
- Verify imports resolve against the installed library
- Report what was done: file path, components used, any assumptions made

### Phase 5: Offer a Storybook story

After the component file is written and verified, ask the user whether they would like a Storybook story scaffolded for the new component. Do not generate the story automatically — wait for explicit confirmation, since not every target repo uses Storybook and the user may want to defer or skip it.

When prompting:

- Check whether the target repo has Storybook installed (look for `@storybook/*` in `package.json` or a `.storybook/` directory). Mention what you found so the user can make an informed call.
- Propose a story file path that follows the repo's existing story conventions (e.g. co-located `*.stories.tsx` next to the component, or under a `stories/` directory — match what the repo already does).
- Ask a single, direct question: "Would you like me to create a Storybook story for this component?"

If the user confirms:

- Write a story file that covers the default rendering of the composed layout.
- **Match the Storybook `layout` parameter to the Figma frame's sizing intent — do not copy it from a sibling story.** Read the design context returned by `get_design_context` for the Figma frame:
  - **Fluid / fill-parent layouts** — frames that emit `size-full`, `content-stretch`, `flex-1`, or whose root element spans via `w-full` — use `layout: "padded"` (gives canvas padding while letting the component stretch) or `layout: "fullscreen"` (no padding). `layout: "centered"` will shrink Storybook's canvas to content, and `w-full` will have no room to span into.
  - **Fixed-dimension compositions** — frames that emit explicit `w-[Npx] h-[Npx]` and contain no fluid children — use `layout: "centered"`.
  - When unsure, default to `"padded"` and note the choice in the closing summary so the user can correct it.
- Include a story per meaningful variant or state visible in the Figma design (e.g. empty, loaded, error) when the data clearly supports it; otherwise stick to a single default story.
- Use the same design system imports and design tokens as the component itself — do not introduce new primitives in the story.
- Report the story file path when done.

If the user declines or asks to skip, stop cleanly without writing anything further.

In the closing summary, mention that the user can optionally run `/verify-design <figma-link> <component-path>` to get a fidelity report against the Figma source. Do not invoke that verification yourself — leave it to the user to decide.

## Operating rules

These rules exist because this skill operates on a *target* repo while the design system is owned and centralized elsewhere. Local detours in the target repo create drift between the two and are very expensive to clean up later.

- **Never create new primitive components in the target repository.** Primitives come from the installed library. When the library is missing a primitive but the design only needs a simple element (separator, container, text wrapper, etc.), use plain HTML styled with the library's design tokens — that is the tier-3 fallback. When the design needs a complex primitive the library does not expose (e.g. Card, Dialog, DropdownMenu), stop and surface this as a library gap rather than building it locally.
- **Never run `shadcn add`** or any command that bypasses the centralized library.
- **Never redefine CSS variables, colors, or design tokens locally** in the target repository. Tokens live in the library.
- **Never invent component APIs.** When Code Connect provides a mapping, use the exact props shown. When it does not, derive props from the library's actual exports — do not pass props the library does not declare.
- **Never import from deep paths inside the library's build output** — use the library's root export only.
- **Never modify the design system library itself** from this workflow. You operate only on the target repository.
- **Never modify entry-point or router files.** The skill's only file output is a standalone component file — created fresh, replaced wholesale, or updated in place per the user's Phase 3 choice — plus optionally a Storybook story if the user opts in during Phase 5. Importing or rendering the new component anywhere else is the user's responsibility.

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
