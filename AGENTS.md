# Agent conventions

## GitHub Actions

- Never use `${{ }}` expressions inside `run:` blocks. Pass them through `env:` instead and reference via shell variables.
- Pin actions to commit SHAs with a `# vN` comment (e.g., `@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7`).
- Run `actionlint` after editing workflow files.
- After making changes, run all CI checks locally: `cargo fmt` then `cargo clippy -- -D warnings` (in `src-tauri/`) and `pnpm run check`.
- Run `cargo fmt` in `src-tauri/` before committing.
- When adding or changing a tool used in the release workflow (e.g. via `baptiste0928/cargo-install` or `anchore/scan-action/download-grype`), keep `.github/workflows/cache-tools-reusable.yml` in sync so the tool/DB is cached for release runs.

## AUR Packaging

- Run AUR packaging tests from the repository root with `~/.local/bin/test-aur-local --variant=both`.
- Test only the source package with `~/.local/bin/test-aur-local --variant=source` or only the binary package with `~/.local/bin/test-aur-local --variant=bin`.
- Use `--no-build` only for generator and lint smoke tests; omit it to test package creation and installation.
- Use `--no-install` to skip installing the `-bin` package, and `--no-cleanup` or `--keep-dir=<path>` to retain build artifacts for debugging.

## Rust

- 4-space indentation. Edition 2024.
- Fallible Tauri commands return `Result<_, String>`. Internal functions return `Result<_, Box<dyn std::error::Error>>`.
- Use `log` crate for Rust logging; log debug messages via `log::debug!`.
- Structs: `#[derive(Clone, Serialize, Debug, PartialEq)]`. Enums: `#[derive(Clone, Serialize, Debug)]`.
- Tagged enums: `#[serde(tag = "type", content = "data")]` with `#[serde(rename = "kebab-case")]` on variants.
- CLI: `clap::Parser` derive, long-form `--` args only, snake_case fields.

## JavaScript / TypeScript / Svelte

- No semicolons. Single quotes. 2-space indent. Trailing commas in multiline.
- File naming: PascalCase for components (`NodeDetail.svelte`), kebab-case for utilities (`store.ts`, `types.ts`).
- Functions/variables: camelCase. Types: PascalCase.
- Imports: Svelte, third-party, local — grouped. Use `import type {...}` for type-only.
- Svelte 5 runes: `$state()`, `$effect()`. Use `onclick` (not `on:click`). SvelteKit `+page.svelte` / `+layout.js`.
- Store pattern: `writable`, `derived`, `get` from `svelte/store`. Use `Map`/`Set` not plain objects for graph data.
- Pin devDependencies exactly (`"3.0.10"`), runtime deps with caret (`"^2"`).

## Git

- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Tags: `vMAJOR.MINOR.PATCH`.
- All changes land via pull requests on a branch (direct pushes to `main` are blocked). Create a `feat/...`, `fix/...`, etc. branch and open a PR.

### When to commit

- Do not leave completed work uncommitted. Once a logical unit of work is done and the tree is green, commit it — don't wait to be asked. This is a standing authorization: treat every task as implicitly including "and commit your work" unless the user says otherwise.
- Commit as you go, not all at once at the end. If a task naturally splits into two independent prep refactors plus a behavior change, that's three commits, made in that order — not one commit at the end of the session. (Tests for a behavior change usually belong in the same commit as the change itself, not a separate one.)

### How to structure commits

- Prefer a fine-grained commit history. Commits should be as small as possible while still being meaningful and self-contained.
- Every commit must compile and pass all tests. No "WIP" commits, no commits that leave the tree broken and rely on a follow-up to fix it.
- Every commit must be formatted and lint-clean. Run `cargo fmt`, `cargo clippy -- -D warnings` and `cargo test` (in `src-tauri/`) and `pnpm run check` before committing — don't introduce a warning in one commit and rely on a later commit (or the user) to clean it up.
- Commit messages explain why, not what. The diff already shows what changed; the message should capture the motivation, the constraint, or the bug being fixed. If the reason is obvious from a one-line subject, no body is needed — but never paraphrase the diff.
- Separate preparatory refactorings from behavior changes. If a fix or feature is easier to review after a refactor, land the refactor in its own commit first. Pure refactors should be behavior-preserving; the commit that changes behavior should be as small as possible. This applies even when the refactor only becomes apparent while writing the behavior change — e.g. you extract a helper to avoid duplication. Don't let "I discovered it mid-change" excuse bundling it in. Before committing, review your diff and split out any hunk that is behavior-preserving (an extraction, a rename, a move) into a preceding commit, by staging hunks or resetting and recommitting in order.
- Wrap the message body to 72 characters. The subject is allowed to go up to 80 characters, or a little more if needed to convey a good single-line summary; the body should be wrapped at 72 exactly.

### Attributing AI usage

- Every commit gets both trailers in a trailer block at the end, after a blank line. Use `--trailer` on the command line so no wrapping or manual formatting is needed:
  - `Co-authored-by: opencode <noreply@opencode.ai>`
  - `Assisted-by: opencode (gemini-3.5-flash-lite)`
- Trailers are exempt from the 72-character body wrap.
- Never use `--author` or `--committer` for this attribution. The release notes template (`.github/cliff-release.toml`) derives the credited `@username` from the commit author, so doing so would replace the user with the bot throughout the release notes.
- `amend!` commits must repeat both trailers in the replacement message body. The replacement overwrites the target's message wholesale, so omitting them strips attribution from the target when the user folds the amend in with `--autosquash`. Plain `fixup!` commits need no special care: their message is discarded on autosquash and the target keeps its own trailers.

### Iterate with fixup! commits

- When refining work that's already committed — adjusting an approach, incorporating an idea from elsewhere, fixing something that belongs to the same logical unit — create a fixup against the target commit (`git commit --fixup=<sha>`) so it sits alongside its target, ready for the user to fold in later with `git rebase --autosquash`. Don't pile follow-up commits on top with the intent of squashing them later.
- This holds even when the target is the most recent commit (HEAD): use `git commit --fixup`, not `git commit --amend`. A direct `--amend` produces the same end state, but the point of a fixup isn't only clean autosquash — it's that the refinement lands as a separate, reviewable commit that the user decides when to fold in. A bare `--amend` rewrites the commit on the spot and skips that checkpoint.
- If the changes don't map cleanly onto existing commits — say they cut across several of them, or restructure something at a different layer than any existing commit naturally owns — stop and ask the user how to proceed. Resetting the branch and redoing the work is sometimes the right call, but it's the user's call to make.
- After writing a fixup, re-read the target commit's message. If anything in that message has become inaccurate or misleading because of the fixup, use an `amend!` commit instead. The safest way to create one is `git commit --fixup=amend:<sha>`, which opens the editor prefilled with the target's existing message for you to revise.
- An `amend!` commit's message has this exact shape:

  ```
  amend! <original subject>

  <new subject>

  <new body>
  ```

  The first line (`amend! <original subject>`) is only the matcher that ties the commit to its target — it must equal the target's current subject. Everything after the blank line is the complete replacement message, so it must begin with a subject line of its own. Even when you only mean to change the body, you still repeat the (unchanged) subject as that first line.
- This is the trap when writing the message by hand with `-m` instead of using the prefilled editor: if you pass only the body, there is no replacement subject line, so after autosquash the target loses its subject and the first body paragraph silently gets promoted to the subject. By hand it must be `-m "amend! <subject>" -m "<subject>" -m "<body>"` — note the subject appears twice, once in the matcher and once as the start of the replacement message.
- A plain `fixup!` keeps the original message verbatim, so message drift stays in unless you explicitly correct it.
- Never squash the fixups yourself. Leave them in the history as separate commits. Do not run `git rebase --autosquash`, do not `git commit --amend` them into their targets, do not reorder or otherwise collapse them — not as a "finishing" step, not to tidy up before handing off, not because the tree looks messy. The whole point of a fixup is that the iteration stays visible and reviewable; squashing it away yourself destroys exactly the artifact it exists to create. Collapsing fixups into their targets is the user's action, taken once they've reviewed the iterations. If you think the history is ready to collapse, say so and leave it to them.
- The same commit-structure rules apply to `fixup!` and `amend!` commits as to regular ones: each must be a self-contained logical unit, and unrelated changes must not be combined just because they happen to target the same commit. If you have two independent refinements for the same target, make two separate fixups. Reviewability of the intermediate state matters even when the end state after autosquash would be identical.

## Code comments

Comments in source code explain why this code is shaped the way it is. They are not the place to narrate the path we took during development — what was tried first, what didn't work, what's "more reliable" or "cleaner" than some alternative. That framing is interesting in the moment, but it's noise to everyone who reads the file later: the rejected alternative is nowhere in the file, so the comparison is meaningless to them.

- Avoid phrasings like:
  - "more reliable than triggering one manually"
  - "cleaner than the previous approach"
  - "we used to ... but ..."
  - "after trying X, we found Y"
  - "X rather than Y", where Y is what the code did before the change
- The iteration story is sometimes worth preserving — but it belongs in the commit message, which is the durable record of why this change was made. The code comment should make sense to someone who has never seen any prior version and is just trying to understand the file as it currently exists.
- The tell is subtler than an explicit "we used to". A comment that justifies the code against an alternative — "run it on a worker rather than blocking the UI", "switch panels in Then rather than a moment earlier" — is history in disguise whenever that alternative is what the code did before the change. It reads as ordinary rationale, but the reader has no way to know the contrast is with a version that no longer exists.
- The check to apply: would you have written this comment if you were writing the file from scratch, with no diff in mind? If not, the sentence belongs in the commit message.

### Don't justify routine call sites

- If the codebase calls a helper in twenty places without explanation, your twenty-first call site doesn't need one either. A comment there says "something here is unusual"; when nothing is, it's noise — and it invites exactly the kind of before/after justification the section above warns about. Look at the neighboring call sites before writing one: if they're bare, match them.

## Surfacing decisions

- When a decision surfaces while you're implementing — a design choice, a tradeoff, a scope cut, a "this turned out harder than expected, so maybe X" — don't quietly make the call and keep going, even if you have a clear recommendation and even if the call seems small. Stop, lay out the options and your recommendation, and let the user weigh in. They want to make these calls with you, not discover them after the fact in the diff.
- This isn't a request to stop and ask about every trivial detail; obvious mechanical choices with one sensible answer don't need a checkpoint. It's about genuine forks — the ones where a reasonable person might pick differently, or where you'd be trading away something the plan assumed (scope, UX, performance, reload behavior, …). When in doubt, surface it.
- This applies with equal force to unforeseen discoveries, not just to decisions you set out to make. If you find something the plan didn't account for — a latent bug, a race, a wrong assumption, a case that turns out unhandled — stop and raise it before designing or writing a fix, even when the fix seems obvious and even when it's "just correctness." Finding the problem is itself the fork: whether to fix it here or in a separate change, how generally to solve it, and whether it reshapes the current work are all calls for the user to make with you.

### Don't present "live with the bug" as an option

- When investigating a defect and laying out fix options for the user, "accept the race / leave it as-is / document it and move on" is not one of them. A known race condition, data corruption, or correctness violation is a bug that needs a real fix, not a tradeoff. Even if the failure rate is low, even if the window is tiny, even if no current code path appears to hit it — present actual fixes.
- If a real fix is genuinely out of reach (e.g. it requires API changes you can't make), say so plainly; don't dress "no fix" up as a viable option in a numbered list alongside real ones.

## Prefer the cleaner design over the smaller diff

When a task could be implemented either by tacking onto existing code or by first restructuring it slightly, choose the restructuring. "Minimal change" is not a goal in itself; a readable final state is. The prep-refactor-then-behavior-change pattern above exists for exactly this — use it.

- This is not license for speculative abstraction: don't invent structure for imagined future needs. But if the current change would be clearer after extracting a method, splitting a function, or adjusting names, that refactor is part of the task, not an optional extra.
- If you catch yourself thinking any of these, stop and refactor first:
  - "This does a bit of wasted work, but it's harmless."
  - "I'll just add the new behavior alongside the old."
  - "The existing method does more than I need, but calling it is fine."

## Logging

- Rust: `log::debug!("message")`. Frontend: `console.log('[zux] ...')`.
