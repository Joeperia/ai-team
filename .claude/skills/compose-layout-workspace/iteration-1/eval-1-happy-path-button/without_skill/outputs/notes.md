# Compose-layout eval - Sign in with Email button

## Detected design system library

**Material UI (MUI) v6** - `@mui/material ~6.4.12`

Detected from `$TARGET_REPO/package.json` peer + dev dependencies:
- `@mui/material`, `@mui/system`, `@mui/icons-material`, `@mui/lab`
- `@mui/x-data-grid-premium`, `@mui/x-date-pickers-pro`, `@mui/x-charts-pro`, `@mui/x-tree-view`
- `@emotion/react` and `@emotion/styled` (MUI's styling engine)

The Figma frame is from an "Aperia-Shadcn" file, but the target repo is an MUI-based
component library, not a shadcn/Radix repo, so the shadcn-styled snippet returned by
the Figma MCP (`<Button variant="default" size="default" shape="default">`) is mapped
to the equivalent MUI primitive.

## Components used

| Figma element     | Component | Import path        |
| ----------------- | --------- | ------------------ |
| Button (orange)   | `Button`  | `@mui/material`    |
| Page wrapper      | `Box`     | `@mui/material`    |

```ts
import { Box, Button } from '@mui/material';
```

## Output path that would have been used in the real repo

`../$TARGET_REPO/src/pages/SignInWithEmailPage.tsx`

Rationale: the existing repo keeps top-level demo / landing pages under
`src/pages/` (for example `src/pages/landing/locale/index.ts`). A single-button
demo screen fits there. An accompanying `index.ts` re-export would normally
be added under the same folder to follow the repo's per-folder barrel
convention, but since this eval writes a single file the page is exported
inline.

## Figma design data captured

- Node id: `1037:71589`
- File key: `Rt3p2w3NtM1X7d9NzDlMdO`
- Label: "Sign in with Email"
- Variables (`get_variable_defs`):
  - `general/primary` = `#f54a00`
  - `general/primary foreground` = `#fafafa`
  - `paragraph/small/font-size` = 14
  - `paragraph/small/line height` = 20
  - `paragraph/paragraph-bold-weight` = `Semibold` (600)
  - `font definitions/font-family-body` = `Geist`
  - `rounded-lg` = 8
  - `xs` = 8, `md` = 16

## Mapping decisions / assumptions

1. **Variant mapping.** The Figma snippet returned shadcn's
   `variant="default"` which is the filled / primary button. In MUI this is
   `variant="contained" color="primary"`. The repo already uses this exact
   combination in `src/errors/Error404.tsx` and `Error500.tsx`, so it is the
   established pattern.
2. **Color tokens.** The Aperia primary orange (`#f54a00`) is assumed to
   already be configured in the consuming app's MUI theme as
   `palette.primary.main`. The page does not hardcode the color - it relies
   on the theme's primary slot, matching how the rest of the repo styles
   buttons.
3. **Typography.** The Figma frame specifies the `Geist` font family at
   14 / 600 / 20px. These are pinned via `sx` so the label matches the
   Figma frame even if the host theme uses a different default font.
   `textTransform: 'none'` is set because MUI defaults buttons to uppercase,
   while the Figma label is sentence case.
4. **Sizing.** Figma renders a wide pill (full-width within a max ~360px
   column). The page uses `fullWidth` with `maxWidth: 360` to reproduce the
   shape regardless of viewport.
5. **Spacing.** `xs` (8) and `md` (16) variables map to vertical / horizontal
   padding inside the button.
6. **Radius.** `rounded-lg` = 8px, applied via `borderRadius: '8px'`.
7. **Click handler.** Since this is a static demo page, a no-op
   `handleClick` is provided so the button is interactive without coupling
   to any auth flow.
8. **No shadcn / Tailwind.** The Figma file is named "Aperia-Shadcn" and the
   MCP-returned snippet uses Tailwind class semantics, but the Figma MCP
   guidance explicitly says to convert to the target stack. The target stack
   is MUI + Emotion, so no Tailwind classes are introduced.
