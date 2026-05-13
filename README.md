# ai-team-poc

A repo containing useful Claude Code skills, subagents, and slash commands — covering workflows like design-to-code and repo pre-flight checks. This repo is **not an application**; it's a harness whose contents operate on *other* repos.

## Prerequisites

- Place this repo in the same directory as your other repos.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create your `.env`:**

   ```bash
   cp .env.example .env
   # then open .env and fill in FIGMA_PAT
   # and the APERIA_DS (name of the aperia ds library)
   ```

3. **Confirm the Figma desktop app is running** with Dev Mode enabled — the Figma-facing skills talk to the Figma MCP server, which is provided by the desktop app.

4. **Open this repo in Claude Code.** The skills, subagents, and slash commands under `.claude/` are picked up automatically.

## Example Usage

Run this from a Claude Code session opened in this repo.

Compose a layout** — turn a Figma design into a new component file in a target repo:

```
/compose-layout <FIGMA_LINK> <REPO_NAME or PATH>
```

## Configuration

`.claude/settings.json` (committed) contains the shared permissions allow-list for tools the kept skills need (Figma MCP tools, `npm run *`, `npx tsc *`, etc.). `.claude/settings.local.json` (gitignored) holds per-user paths under `$TARGET_REPO`.

If you hit a permission prompt during a skill run, that's expected for any operation outside the shared allow-list — approve it once and Claude Code will remember it locally.

## What this repo does **not** do

- Modify the design system library — skills operate on target repos only, never edit the central library.
- Install dependencies into target repos — if a primitive is missing, the skill reports it as a library gap.
- Wire new components into entry-point or router files — composition only; the user imports the new file themselves.
