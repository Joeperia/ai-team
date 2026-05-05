I can't run this yet — I'm missing the target repository.

Implementing a Figma design as a page requires me to write the file into a specific app repo that has a framework (Next.js / Vite / etc.) and the Aperia Shadcn component library installed. The current working directory (`ai-team-poc`) is a design-tokens tooling repo — its `package.json` only has `dotenv` and a couple of Figma-token scripts, so it isn't a valid destination.

Could you tell me which repository to drop this page into? A name or absolute path is fine — for example:

- `aperia-shadcn` (the library repo itself, if you want a demo/preview page there)
- `aperia-web` / `aperia-app` / whichever product app consumes `@aperia/shadcn`
- An absolute path like `../<repo-name>`

Once you confirm the target, I'll:

1. Open that repo, read its `CLAUDE.md` (if present) and `package.json` to confirm the framework and the exact installed component-library package name.
2. Pull the Figma node `1037-71589` from the `Aperia-Shadcn` file via the Figma MCP, including each instance's Code Connect mapping (imports + props).
3. Send back a short inventory — components found, their import paths, the proposed output file path, and anything ambiguous — for you to confirm before I write any code.
4. Write the page, importing every primitive from the installed library using the exact Code Connect paths, and using semantic Tailwind tokens (`bg-primary`, `text-muted-foreground`, etc.) rather than raw values.

A couple of optional clarifications that would also help, but I can make reasonable calls on them if you'd rather not spell them out:

- **Route / file name** — e.g. should this live at `app/<something>/page.tsx`? If you don't say, I'll derive a name from the Figma frame title and surface it in the inventory for approval.
- **Static vs. wired-up** — I'll default to a static composition (placeholder text/data straight from Figma, no data fetching, no form handlers). Say the word if you want stubs for any interactions.

Send me the target repo and I'll proceed from Phase 1.
