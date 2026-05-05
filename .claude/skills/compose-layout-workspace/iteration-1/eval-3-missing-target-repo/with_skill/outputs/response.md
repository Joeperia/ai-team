I can help implement that Figma design as a page, but I need one more piece of information before I can start.

## Missing input: target repository

The compose-layout workflow operates on two parameters:

1. **figma_link** — provided: `https://www.figma.com/design/Rt3p2w3NtM1X7d9NzDlMdO/Aperia-Shadcn?node-id=1037-71589&m=dev`
2. **target_repo** — **not provided**

I need to know which repository the page should be written into, because the very first phase of the workflow is to:

- Navigate to the target repo and verify it exists
- Read its `CLAUDE.md` for conventions
- Read its `package.json` to detect the design system library that's actually installed (the exact internal scoped package name — e.g. `@<org>/components`, `@<org>/ui`, etc.)
- Inspect existing pages to learn the project's routing/file structure

Without the target repo I cannot detect the library, cannot resolve Code Connect import paths against it, and cannot determine the correct output file path. Guessing any of these would risk writing the page into the wrong project or importing from a library that isn't installed there — both expensive to undo.

## What I need from you

Please reply with one of:

- The **name** of the target repo (e.g. `aperia-web`, `customer-portal`), if it lives alongside this workspace, or
- An **absolute filesystem path** to the repo on your machine

Optional, but helpful if you have a preference:

- A specific route or file path where the page should land (otherwise I'll propose one based on the repo's conventions during the inventory step)

Once I have the target repo, I'll:

1. Orient to the repo and confirm the installed design system library
2. Read the Figma node and collect Code Connect mappings for every component instance
3. Present an inventory (components, imports, proposed output path, any blockers) for your confirmation
4. Implement the page and report back

Standing by for the target repo.
