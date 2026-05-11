---
name: check-library-compat
description: Check whether a target repository has the right npm packages installed to consume the `aperia-ds5` design-system library (also commonly aliased as `@shad/components`). Inspects the target's `package.json` for the four packages the library needs (the library itself under either name, `react >=18`, `react-dom >=18`, `tailwindcss >=4`) and reports PASS / PARTIAL / FAIL per package plus an overall verdict. Replies inline in chat — never writes a file. Use whenever the user pairs a repo name or path with a question about library compatibility, design-system setup, or whether their packages are right — phrases like "check if [repo] has the right packages", "is [repo] compatible with aperia-ds5", "do I have what I need in [repo]", "verify packages in [repo]", "preflight [repo]", "will the library work in [repo]", "is [repo] set up for the design system". Trigger even if the user does not say "compatibility" or "check" — pairing a target repo with a question about its packages, the design system, or aperia-ds5 readiness is the strong signal.
---

# check-library-compat

Verify a target repository has the npm packages needed to consume the `aperia-ds5` design-system library. The output is a one-screen chat reply — verdict plus a four-row table. No files written.

## Input

One parameter: **target_repo** — the name or filesystem path of the repository to check.

If `target_repo` is missing, ambiguous, or doesn't resolve to a directory containing `package.json`, stop and ask. Do not guess — running the check on the wrong directory wastes time and produces a misleading report.

## What to check

Read `<target_repo>/package.json` and verify these four packages. The version requirements come from the library's declared `peerDependencies` plus the implicit Tailwind v4 requirement (the library's CSS exports — `aperia-ds5/token.css` and `aperia-ds5/base.css` — are authored against Tailwind v4 and will not compile under v3).

| # | Package | Required version | Where it should live |
|---|---|---|---|
| 1 | `aperia-ds5` **or** `@shad/components` | any | `dependencies` |
| 2 | `react` | `>=18` | `dependencies` |
| 3 | `react-dom` | `>=18` | `dependencies` |
| 4 | `tailwindcss` | `>=4` | `dependencies` or `devDependencies` |

The library is published as `aperia-ds5` (its `package.json name`) but real-world consumers often install it under the alias `@shad/components` via the npm `file:` protocol. Either key satisfies check #1 — same library, two accepted names. If both names appear (unusual), report whichever has a real version range and note the duplicate in the row.

For version checks, parse the range string in the consumer's `package.json` and compare it against the requirement:

- `^4.0.0`, `~4.1.2`, `4.x`, `>=4.0.0`, `4.0.0` all satisfy `>=4`
- `^3.4.0`, `~3.4.0`, `3.x`, `<4`, `3.4.0` do not
- Pre-release versions count by their major (`4.0.0-beta.1` satisfies `>=4`)

When a range is ambiguous (e.g., `*`, `latest`, a git URL, a workspace protocol), report the literal value found and mark the row PARTIAL with a one-line note — the user needs to resolve the ambiguity, not you.

## Per-check status

- **PASS** — package present in the right section and the version satisfies the requirement
- **PARTIAL** — package present but the version doesn't satisfy, OR the package is in the wrong section (e.g., `react` in `devDependencies` instead of `dependencies`)
- **FAIL** — package missing entirely from both `dependencies` and `devDependencies`

The PASS/PARTIAL distinction matters because a PARTIAL means "you almost have it" — a single edit fixes the row. FAIL means the package was never installed and the user needs to run `npm install`.

## Overall verdict

- **PASS** — every check is PASS
- **PARTIAL** — no FAILs but at least one PARTIAL
- **FAIL** — at least one FAIL

## Output

Reply inline in the chat. **Do not write a file under any circumstances** — no report files, no summary docs, no JSON. The chat reply is the artifact.

Use this template:

```
**Library compat check — <repo name or path>**

Verdict: **<PASS | PARTIAL | FAIL>**

| Package | Required | Found | Status |
|---|---|---|---|
| aperia-ds5 / @shad/components | any | <name@version, or "missing"> | <PASS|PARTIAL|FAIL> |
| react | >=18 | <version or "missing"> | <PASS|PARTIAL|FAIL> |
| react-dom | >=18 | <version or "missing"> | <PASS|PARTIAL|FAIL> |
| tailwindcss | >=4 | <version or "missing"> | <PASS|PARTIAL|FAIL> |

<One short line per non-PASS row, e.g. "Bump tailwindcss from ^3.4.0 to ^4.0.0" or "Add aperia-ds5 to dependencies and install">
```

If every row passes, end at the table — no "next steps" needed when there's nothing to fix.

## Operating rule

This is a read-only check. Do not edit, install, or scaffold anything in the target repo. If the user asks for a fix mid-check, finish the report first, then handle the fix as a separate request.
