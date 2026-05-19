# Skill conventions

Cross-cutting rules every skill in this directory follows. When a skill's own `SKILL.md` is silent on something covered here, this doc is authoritative.

## Variables

### Environment (loaded from `.env`)

| Name | Meaning | Used by |
|---|---|---|
| `APERIA_DS` | Canonical name of the centralized design-system library. | Every skill that references "our library" as a concept. |
| `FIGMA_PAT` | Figma personal access token, for REST API access. | Skills that hit the Figma REST API directly. |
| `FIGMA_FILE_KEY` | Default Figma file key for token-pull workflows. | `fetch-figma-vars`-style skills. |

Never hardcode the literal value (`aperia-ds5`, a token, a file key) in skill prose, examples, or expected eval outputs.

### Runtime (bound on entry / detected during run)

| Name | Bound by | Meaning |
|---|---|---|
| `$TARGET_REPO` | Skill input | Filesystem path or name of the repo the skill is acting on. |
| `$APERIA_DS_PACKAGE` | Phase 1 detection from `<$TARGET_REPO>/package.json` | The actual import name `$APERIA_DS` is installed under in this target. Must equal `$APERIA_DS` or be a documented alias (e.g. `@<org>/components`); otherwise halt. |
| `$FIGMA_LINK` | Skill input | Figma URL, node ID, or selection reference for this run. |

Agents may introduce their own runtime variables (`$COMPONENT_PATH`, `$STORY_PATH`, etc.) following the same pattern.

## Variable names: literal in prose, substituted in code

In **prose** (skill text, agent inputs, eval expectations), keep `$NAME` literal — it's a label:

> "Phase 1 detects `$APERIA_DS_PACKAGE` by reading the target's package.json."

In **emitted code, file paths, or shell args**, substitute the bound value:

```tsx
// ❌ WRONG — placeholder emitted as literal
import { Button } from '$APERIA_DS_PACKAGE'
// ✅ CORRECT — substituted with Phase 1's bound value
import { Button } from 'aperia-ds5'
```

Worked examples in `SKILL.md` files may show `$NAME` to mark substitution points, but always with a one-line note that emitted code carries the bound value.

Evidence this is non-obvious: `compose-layout-workspace/iteration-1/eval-2-happy-path-larger/without_skill/outputs/page.tsx:11` shows a baseline LLM emitting `from '$TARGET_REPO_PACKAGE/common'` as literal code.

## How to apply

1. Read `$APERIA_DS` from env and bind runtime variables from inputs in Phase 1.
2. Validate `$APERIA_DS_PACKAGE` against `$APERIA_DS`; halt if mismatched.
3. In prose, refer by `$NAME` literal; in emitted code, substitute the bound value.
4. Never hardcode either env or runtime values in prose, examples, or expected outputs.
5. Halt when a required variable is missing — do not guess defaults.
