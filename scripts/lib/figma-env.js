// Shared env loader for Figma scripts.
// Reads FIGMA_PAT and FIGMA_FILE_KEY from process.env.

export function loadFigmaEnv() {
  const FIGMA_PAT = process.env.FIGMA_PAT;
  const FILE_KEY = process.env.FIGMA_FILE_KEY;

  if (!FIGMA_PAT) {
    throw new Error(
      'FIGMA_PAT missing from environment.\n' +
      'Add FIGMA_PAT=<token> to .env at the repo root.'
    );
  }
  if (!FILE_KEY) {
    throw new Error(
      'FIGMA_FILE_KEY missing from environment.\n' +
      'Add FIGMA_FILE_KEY=<key> to .env at the repo root.'
    );
  }

  return { FIGMA_PAT, FILE_KEY };
}
