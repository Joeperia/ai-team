---
description: Verify that a generated component matches its Figma source design
argument-hint: <figma-link> <component-path> [target-repo-name]
---

Verify the component at $2 matches the Figma design at $1, optionally scoped to the target repository at $3.

Delegate to the `design-verifier` subagent. Pass these inputs:

- `$FIGMA_LINK` — $1
- `$COMPONENT_PATH` — $2
- `$TARGET_REPO` — $3 if provided, otherwise infer from the current working directory
- `$TARGET_REPO_PACKAGE` — derive by reading the target repo's `package.json` and detecting the internal scoped design-system dependency (same approach `compose-layout` uses)

If $1 looks malformed (not a Figma URL or node-id) or $2 does not exist, stop and ask before delegating.

The subagent will return a structured fidelity report (verdict + severity-tagged discrepancies). Surface its output to the user verbatim.
