# ai-team-poc

A Claude Code harness for translating Figma designs into page-level code in target repositories. This repo is **not an application** — it ships Claude Code skills, a slash command, and a small Figma tokens script that other repos can be operated on with.

## What's in here

### Skills (`.claude/skills/`)

| Skill | Purpose |
|---|---|
| `compose-layout` | Implements a Figma design as a page in a target repo, using whatever design system library that repo has installed. Detects the library from the target repo's `package.json` at runtime and uses Code Connect mappings for exact imports. |
| `fetch-figma-vars` | Pulls Figma variables (tokens, collections) for the file in `FIGMA_FILE_KEY` and writes them to `figma-variable.json`. Wraps the script described below. |
| `compose-layout-workspace/` | Eval data for benchmarking the `compose-layout` skill. Not a runtime skill — used by `python -m scripts.aggregate_benchmark`. |

### Slash command (`.claude/commands/`)

- **`/compose-layout <figma-link> <target-repo-name>`** — delegates to the `compose-layout` skill.

### Scripts (`scripts/`)

- **`fetch-figma-vars.js`** — fetches Figma variables via the Figma REST API and writes `figma-variable.json` to the repo root. Run via `npm run tokens:pull`.
- **`lib/figma-env.js`** — shared env loader that validates `FIGMA_PAT` and `FIGMA_FILE_KEY`.

## Setup

1. **Clone and install:**

   ```bash
   git clone <this-repo>
   cd ai-team-poc
   npm install
   ```

2. **Create your `.env`:**

   ```bash
   cp .env.example .env
   # then open .env and fill in FIGMA_PAT (and FIGMA_FILE_KEY if you'll run tokens:pull)
   ```

3. **Confirm the Figma desktop app is running** with Dev Mode enabled — the `compose-layout` skill talks to the Figma MCP server, which is provided by the desktop app.

4. **Open this repo in Claude Code.** The skills and `/compose-layout` command will be picked up automatically from `.claude/`.

## Usage

### Compose a layout

In a Claude Code session opened in this repo:

```
/compose-layout <figma-url> <target-repo-name>
```

Example: `/compose-layout https://www.figma.com/design/abc/.../node-id=1387-28899 my-storybook-repo`

The skill will:
1. Orient itself to the target repo (`../<target-repo-name>` relative to this repo's parent directory).
2. Read the Figma design via the Figma MCP.
3. Present a component inventory and proposed output file path for confirmation.
4. Write a single new component file using the design system library's exact Code Connect imports.
5. Optionally scaffold a Storybook story when prompted.

### Pull Figma variables

```bash
npm run tokens:pull
```

Writes `figma-variable.json` to the repo root. Requires `FIGMA_FILE_KEY` in `.env`.

### Run skill evals

```bash
python -m scripts.aggregate_benchmark .claude/skills/compose-layout-workspace/iteration-1 --skill-name compose-layout
```

## Configuration

`.claude/settings.json` (committed) contains the shared permissions allow-list for tools the kept skills need (Figma MCP tools, `npm run *`, `npx tsc *`, etc.). `.claude/settings.local.json` (gitignored) holds per-user paths under `$TARGET_REPO`.

If you hit a permission prompt during `/compose-layout`, that's expected for any operation outside the shared allow-list — approve it once and Claude Code will remember it locally.

## What this repo does **not** do

- Modify the design system library — `compose-layout` operates on target repos only, never edits the central library.
- Install dependencies into target repos — if a primitive is missing, the skill reports it as a library gap.
- Wire new components into entry-point or router files — composition only; the user imports the new file themselves.
