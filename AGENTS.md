# Agent conventions

## GitHub Actions

- Never use `${{ }}` expressions inside `run:` blocks. Pass them through `env:` instead and reference via shell variables.
- Pin actions to commit SHAs with a `# vN` comment (e.g., `@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7`).
- Run `actionlint` after editing workflow files.
- After making changes, run all CI checks locally: `cargo fmt` then `cargo clippy -- -D warnings` (in `src-tauri/`) and `pnpm run check`.
- Run `cargo fmt` in `src-tauri/` before committing.

## AUR Packaging

- Run AUR packaging tests from the repository root with `~/.local/bin/test-aur-local --variant=both`.
- Test only the source package with `~/.local/bin/test-aur-local --variant=source` or only the binary package with `~/.local/bin/test-aur-local --variant=bin`.
- Use `--no-build` only for generator and lint smoke tests; omit it to test package creation and installation.
- Use `--no-install` to skip installing the `-bin` package, and `--no-cleanup` or `--keep-dir=<path>` to retain build artifacts for debugging.

## Rust

- 4-space indentation. Edition 2024.
- Import order: external crates, std, crate-local — alphabetical within each group.
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

## Logging

- Rust: `log::debug!("message")`. Frontend: `console.log('[zux] ...')`.
