---
description: Compose a Figma design into a target repo, then verify the result against the source design
argument-hint: <figma-link> <target-repo-name>
---

Run a two-step workflow against the Figma design at $1 and the target repository at $2.

If either argument looks malformed or missing, stop and ask before delegating to anything.

## Step 1 — Compose

Implement the design using the `implement-design` skill, passing $1 as the figma link and $2 as the target repo. Let the skill run to completion (inventory confirmation, write, etc.).

If `implement-design` halts (missing library, ambiguous inputs, user declines the inventory), do not proceed to Step 2 — report the stop reason and exit.

## Step 2 — Verify

Follow `.claude/commands/verify-design.md` with **no positional args**. Its "Resolving inputs" section will auto-detect the just-composed run in this conversation (page component path, Figma link, and `$APERIA_DS_PACKAGE` reused from `implement-design`'s Phase 1), prompt the user once to confirm via `AskUserQuestion`, and then delegate to the `design-verifier` subagent.

`/verify-design`'s own "After the report — offer fixes" flow handles the auto-fix interaction — nothing extra to do here.
