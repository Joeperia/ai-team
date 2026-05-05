---
name: fetch-figma-vars
description: Run the project's scripts/fetch-figma-vars.js script to fetch Figma variables. Invoke when a subagent or user asks to fetch Figma variables, refresh Figma tokens, or sync design variables from Figma.
---

# fetch-figma-vars

Run the `fetch-figma-vars.js` script located in the project's `scripts/` directory.

## Steps

1. Verify the script exists at `scripts/fetch-figma-vars.js` (relative to the repo root).
2. Run it with Node from the repo root:

   ```bash
   node scripts/fetch-figma-vars.js
   ```

3. Report the script's output (or any error) back to the caller.

## Notes

- The script reads `FIGMA_PAT` and `FIGMA_FILE_KEY` from the repo `.env` file. If either is missing, the script will throw — surface that error verbatim rather than retrying.
- Do not modify the script or its inputs unless explicitly asked.
