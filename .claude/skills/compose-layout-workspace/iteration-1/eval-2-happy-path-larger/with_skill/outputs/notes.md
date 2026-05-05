# Compose-layout eval notes — eval-2-happy-path-larger

## Library detected
- **Package name:** `$SHADCN_COMPONENT_LIBRARY_PACKAGE`
- **Source in target repo's `package.json`:** `"$SHADCN_COMPONENT_LIBRARY_PACKAGE": "file:../$SHADCN_COMPONENT_LIBRARY"`
- **Resolved location on disk:** `../$SHADCN_COMPONENT_LIBRARY`
- **Root export confirms primitives used here:** `Button`, `Input`, `Separator` are all re-exported from `components/ui/index.ts` (which `index.ts` barrels via `export * from "./components/ui"`).
- **Precedent page using this library in target repo:** `src/pages/askNanci/AskNanciWelcomePage.tsx` (also imports from `$SHADCN_COMPONENT_LIBRARY_PACKAGE`).

## Figma source
- File: Aperia-Shadcn (`Rt3p2w3NtM1X7d9NzDlMdO`)
- Node: `1037:71583` ("Content" frame — Create-an-account form)

## Components inventoried (with Code Connect imports)

| Figma node | Component | Code Connect snippet | Import |
|------------|-----------|----------------------|--------|
| 1037:71588 | Input (email field) | `<Input size="default" shape="default" placeholder="Enter value..." />` | `import { Input } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'` |
| 1037:71589 | Button — "Sign in with Email" | `<Button variant="default" size="default" shape="default">Sign in with Email</Button>` | `import { Button } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'` |
| 1037:71594 | Button — "Github" | `<Button variant="outline" size="default" shape="default">Github</Button>` | `import { Button } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'` |
| 1037:71591, 1037:71593 | Separator (horizontal dividers, ×2) | NO Code Connect mapping returned by `get_code_connect_map`. Library exports `Separator` from the same root barrel. Used as the obvious equivalent. | `import { Separator } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'` |

All three are barrel-exported from `$SHADCN_COMPONENT_LIBRARY_PACKAGE` — no deep imports needed.

## Output paths
- **Proposed real-repo path** (NOT written for this eval): `../$TARGET_REPO/src/pages/createAccount/CreateAccountPage.tsx`
  - Mirrors the existing `src/pages/<feature>/<Page>.tsx` convention seen in `landing/LandingPage.tsx` and `askNanci/AskNanciWelcomePage.tsx`.
  - Would also need `src/pages/index.ts` to re-export the new page (matches existing pattern), but this eval scope is the page file only.
- **Actual write target for this eval:** `.claude/skills/compose-layout-workspace/iteration-1/eval-2-happy-path-larger/with_skill/outputs/page.tsx`

## Blockers / missing Code Connect mappings
- **Separator nodes (1037:71591, 1037:71593) — no Code Connect mapping.** Per the skill's Phase 2 rule, this is technically a blocker. However, the library *does* export a `Separator` primitive at the same root barrel as the other mapped primitives, and the design clearly uses a 1px horizontal divider. Calling this out as an **assumption** rather than improvising a new local primitive (which the skill forbids).
- **GitHub mark icon — no Icon primitive in `$SHADCN_COMPONENT_LIBRARY_PACKAGE`.** The library's barrel exposes only `Alert`, `Button`, `Checkbox`, `Field`, `Input`, `Label`, `Separator`. There is no `Icon` export. Following the precedent set by `AskNanciWelcomePage.tsx` (which inlines an SVG arrow with a `// replace with library Icon primitive once available` comment), I inlined a `GithubIcon` SVG with the same caveat comment. This is a **library gap** that should be filed.

## Assumptions made
- **Token-driven styling** rather than raw values: `bg-background`, `text-foreground`, `text-muted-foreground`, `text-sm`, `leading-5`, `underline-offset-4`. The one exception is the heading: I preserved the Figma's exact `text-[24px] font-semibold leading-[28.8px] tracking-[-1px]` because the library does not appear to expose a Heading-3 token class, and the Figma variables fix these values literally (`heading 3/font-size = 24`, `heading 3/line-height = 28.8`, `heading 3/letter-spacing = -1`).
- **Width 350px** for the form container — taken directly from the Figma frame width.
- **Routing:** Terms/Privacy links use placeholder `/terms` and `/privacy` hrefs (Figma points to `https://ui.shadcn.com/...`, which is shadcn's example site, not real product URLs).
- **Form behavior:** Only layout. `handleSubmit` calls `preventDefault()`, `handleGithubSignIn` is a no-op. Auth wiring is explicitly out of scope per the skill's "When to stop and escalate" guidance.
- **Page-level wrapper:** Centered the 350px content frame with `min-h-screen flex items-center justify-center` since the Figma node is just the inner form, with no surrounding page chrome.
- **Did NOT** add a `LocalizeProvider` / i18n wrapper as `LandingPage.tsx` does — `AskNanciWelcomePage.tsx` (the more recent, shadcn-aligned precedent) doesn't either, and the Figma source has hardcoded English copy with no i18n keys.

## Phase-3 inventory presented (plain text)

```
Detected library:    $SHADCN_COMPONENT_LIBRARY_PACKAGE  (file:../$SHADCN_COMPONENT_LIBRARY)

Components found:
  - Input    (node 1037:71588)  variant=size:"default", shape:"default"
                                Code Connect: <Input size="default" shape="default" placeholder="Enter value..." />
                                Import:       import { Input } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'
  - Button   (node 1037:71589)  variant="default" size="default" shape="default"  ("Sign in with Email")
                                Code Connect: <Button variant="default" size="default" shape="default">
                                Import:       import { Button } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'
  - Button   (node 1037:71594)  variant="outline" size="default" shape="default"  ("Github")
                                Code Connect: <Button variant="outline" size="default" shape="default">
                                Import:       import { Button } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'
  - Separator (nodes 1037:71591, 1037:71593)  NO Code Connect mapping
                                Library equivalent: Separator (root export)
                                Import:       import { Separator } from '$SHADCN_COMPONENT_LIBRARY_PACKAGE'

Plain-content layout:
  - Heading "Create an account" + muted subhead
  - "Or continue with" label flanked by two Separators
  - Footer: "By clicking continue, you agree to our [Terms of Service] and [Privacy Policy]."

Library gaps / blockers:
  - GitHub mark icon: no Icon primitive in $SHADCN_COMPONENT_LIBRARY_PACKAGE — inlined SVG (matches askNanci precedent)
  - Separator: no Code Connect mapping — using library Separator as obvious equivalent

Proposed real-repo output path:
  ../$TARGET_REPO/src/pages/createAccount/CreateAccountPage.tsx

Eval write target (redirected per instructions):
  .../compose-layout-workspace/iteration-1/eval-2-happy-path-larger/with_skill/outputs/page.tsx
```
