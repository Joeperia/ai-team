---
description: Implement a Figma design as a page or layout in a target repository, using the design system component library installed in that repo
argument-hint: <figma-link> <target-repo-name>
---

Implement the Figma design at $1 as a page in the target repository at $2 using the `compose-layout` skill.

The skill will detect the design system library from the target repo's package.json, fetch the Figma data via the Figma MCP, present an inventory for confirmation, then write the page using the library's exact Code Connect imports.

If either argument looks malformed or missing, stop and ask before delegating to the skill.
