<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git safety

- Work on `dev` or another non-production branch by default.
- AI agents must never push, merge, force-push, or otherwise write to `main` unless the user explicitly asks for that exact action in the current conversation.
- A request to implement, commit, deploy, or "finish" does not by itself authorize a push to `main`.
