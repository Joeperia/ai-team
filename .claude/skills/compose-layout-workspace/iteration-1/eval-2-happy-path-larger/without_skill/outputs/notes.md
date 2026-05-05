# Compose Layout - Notes

## Detected Library

**`$TARGET_REPO_PACKAGE`** (the package's own `name` in `$TARGET_REPO/package.json`).

This is a MUI-based design system (peer-deps include `@mui/material ~6.4.12`, `@mui/system`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`). Components are prefixed `Tap*` (e.g. `TapButton`, `TapTextField`, `TapTypography`, `TapDivider`, `TapBox`, `TapGrid`) and live under `src/common/`.

External consumers import them from the `$TARGET_REPO_PACKAGE/common` subpath alias (per the package's `exports` field and `docs/import-guidelines.md`).

## Components Used

| Figma element | Component | Import path |
|---|---|---|
| "Create an account" heading | `TapTypography` (`variant="h3"`, `weight="semibold"`) | `$TARGET_REPO_PACKAGE/common` |
| "Enter your email below…" subheading | `TapTypography` (`variant="small-body"`, muted color) | `$TARGET_REPO_PACKAGE/common` |
| Email input | `TapTextField` (with `placeholder`, `type="email"`) | `$TARGET_REPO_PACKAGE/common` |
| "Sign in with Email" CTA | `TapButton` (`variant="solid"`, `color="primary"`, `size="large"`) | `$TARGET_REPO_PACKAGE/common` |
| Horizontal "Or continue with" rule | `TapDivider` (×2, flanking centered text) | `$TARGET_REPO_PACKAGE/common` |
| "Github" secondary button | `TapButton` (`variant="ghost"`, `color="secondary"`, `size="large"`) | `$TARGET_REPO_PACKAGE/common` |
| GitHub leading icon | `GitHubIcon` | `@mui/icons-material/GitHub` |
| Terms / Privacy footer links | `Link` | `@mui/material` |
| Layout primitives | `TapBox` + MUI `styled` | `$TARGET_REPO_PACKAGE/common` + `@mui/material/styles` |
| Layout boxes | `styled(TapBox)` blocks | `@mui/material/styles` |

`TapTextField` is a thin wrapper over MUI's filled `TextField` (sizes `small`/`medium`, height 28/44). `TapButton` dispatches between `TapSolidButton` and `TapGhostButton` based on `variant`.

## Output Path (in real repo)

Following the existing `src/pages/landing/LandingPage.tsx` convention, the page would have been written to:

```
../$TARGET_REPO/src/pages/createAccount/CreateAccountPage.tsx
```

…and re-exported from `src/pages/index.ts`:

```ts
export * from './createAccount/CreateAccountPage';
```

(Per the task instructions, no files were actually written into the real repo.)

## Assumptions

1. **Library mapping.** The Figma design uses Shadcn/Tailwind primitives (`<Input>`, `<Button>`, `--general/foreground`, `--general/muted-foreground` etc.). I mapped these to the closest semantic equivalents in `$TARGET_REPO_PACKAGE` rather than transliterating the Tailwind classes. Per the Figma MCP server's instructions, the React+Tailwind reference is meant to be adapted to the target stack, not copied verbatim.
2. **Button variants.** The Figma "default" button (orange, filled, white text) maps to `TapButton variant="solid" color="primary"`. The "outline" Github button is mapped to `variant="ghost" color="secondary"` — `TapButton` only exposes `solid | ghost`, so ghost is the closest analog to an outlined secondary button. (If a true outlined treatment is required, `TapOutlinedInput`-style theming or a custom variant would need to be added.)
3. **Typography.** Figma's `heading 3 / 24px / semibold / -1px tracking` maps to `TapTypography variant="h3" weight="semibold"`. Figma's `paragraph small / 14px / 20px line-height` maps to `variant="small-body"`. Exact font-family is supplied by the design-system theme rather than overridden inline.
4. **Github icon.** Figma references an internal `Icon / github` component (node `533:54119`). I used `@mui/icons-material/GitHub`, which is already a peer-dep of the library and visually matches.
5. **Layout.** Figma shows a centered card on a transparent canvas. I wrapped the form in a centered, full-viewport `Root` (max-width 360px) so the page can be dropped in standalone. If this is meant to be embedded inside a parent shell (e.g. a modal or auth layout), the `Root` wrapper can be replaced with the parent's container.
6. **Form behavior.** Figma is presentation-only. I added a minimal controlled-input + `onSubmit` form with optional `onSubmitEmail` / `onContinueWithGithub` props so the page is functional once wired up.
7. **Terms / Privacy hrefs.** Figma points at `ui.shadcn.com/terms` and `ui.shadcn.com/privacy`. I exposed these as overridable props (`termsHref` / `privacyHref`) defaulting to those values.
8. **Color tokens.** The orange `Sign in with Email` button color is supplied by the consuming app's theme (`palette.primary.main`). The page intentionally avoids hard-coding `#FF5A1F`-style hex values so it inherits the host app's primary brand color.
