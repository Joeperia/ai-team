---
description: Verify that a generated component matches its Figma source design
argument-hint: [figma-link] [component-path] [target-repo-name]
---

Verify a component against its Figma source. With explicit args, verifies the component at $2 against the Figma design at $1, optionally scoped to the target repository at $3. With no args, auto-detects the most recently composed component in this conversation (see "Resolving inputs" below).

## Resolving inputs

Decide what to pass to the verifier using this precedence:

1. **Explicit args** — If $1 and $2 are both supplied, bind `$FIGMA_LINK` ← $1 and `$COMPONENT_PATH` ← $2 and skip the rest of this section.
2. **Auto-detect from a recent compose-layout run** — If no args were supplied, scan the most recent assistant turns in this conversation for a completed `compose-layout` (or `compose-layout-and-verify`) run. From its closing summary extract:
   - `$COMPONENT_PATH` — the **last absolute file path** written by the skill. `compose-layout` writes sub-components first and the assembling page component last, so the last reported path is the page component. If only one path was written, that path is the page component.
   - `$FIGMA_LINK` — the Figma URL or node-id passed into that run.
   - `$APERIA_DS_PACKAGE` — reuse the value `compose-layout` detected in its Phase 1; do not re-detect.

   Verify the detected `$COMPONENT_PATH` still exists on disk. If it does not, treat as not-detected and fall through to step 3.

   If detected, prompt the user with `AskUserQuestion` (single-select). Display the detected path and Figma link in the question body so the user can eyeball them, and offer three options:
   - **Yes, verify** — proceed with the detected `$FIGMA_LINK` and `$COMPONENT_PATH`.
   - **Use different params** — ask the user inline for `$FIGMA_LINK` and `$COMPONENT_PATH`, then proceed with those.
   - **Cancel** — exit cleanly; do not delegate.
3. **Ask** — If no args were supplied and no prior `compose-layout` run is detectable in this conversation, stop and ask the user for the Figma link and component path before delegating.

Delegate to the `design-verifier` subagent. Pass these inputs:

- `$FIGMA_LINK` — bound in "Resolving inputs" above.
- `$COMPONENT_PATH` — bound in "Resolving inputs" above.
- `$TARGET_REPO` — $3 if provided, otherwise infer from the current working directory.
- `$APERIA_DS_PACKAGE` — if `compose-layout` ran earlier in this conversation, reuse the value it detected; otherwise derive by reading the target repo's `package.json` and detecting the internal scoped design-system dependency (same approach `compose-layout` uses).

If `$FIGMA_LINK` looks malformed (not a Figma URL or node-id) or `$COMPONENT_PATH` does not exist, stop and ask before delegating.

The subagent will return a structured fidelity report (verdict + severity-tagged discrepancies). Surface its output to the user verbatim.

## After the report — offer fixes

Once the report is shown, look at its `## Auto-fixable` section.

- If the section says `(none)` or is empty, stop. Nothing more to do.
- Otherwise, prompt the user with `AskUserQuestion` and let them pick which fixes to apply:
  - Use one **multi-select** question titled "Which fixes should I apply?"
  - Each option = one auto-fixable finding, labeled by node + the change (e.g. "Primary button — font-medium → font-semibold"). Put the file:line and exact Fix in the option `description` so the user can see what they're approving.
  - If there are more than 4 auto-fixable findings, batch them: ask "Apply all auto-fixable changes, choose individually, or skip?" first; only enumerate when the user picks "choose individually" (paginate 4 at a time if needed).

### Applying the selected fixes

Apply the user's selected fixes **one at a time**, each as its own `Edit` tool call, in the order they appeared in the report. Do not batch them into a single Edit or use `replace_all`. Each Edit renders its own diff in the UI — that's the point. Between edits, do not add commentary; just keep applying.

- Use the exact Fix line from the report. Do not improvise or "improve."
- Read `$COMPONENT_PATH` once before the first edit if you haven't already in this session.
- Never touch items in `## Needs human review` without the user explicitly asking. Mention they exist; do not auto-apply.
- After all selected fixes are applied, report a one-line summary: how many applied, how many declined, how many left for human review. Do not re-run the verifier unless asked.
