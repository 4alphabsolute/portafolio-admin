## Copilot instructions — Flowise workspace

Purpose: help AI coding agents become productive quickly by pointing to the small, Flowise-centric codebase layout and developer workflows discoverable here.

- Key files
  - `package.json` — only runtime dependencies are declared (notably `flowise@^3.0.10` and `turndown`).
  - `package-lock.json` — exact dependency versions; useful for reproducing installs.
  - `.env` and `loginout.env` — environment variables and provider API keys live here (treat as secrets).
  - `node_modules/flowise` — most runtime logic is supplied by the `flowise` package. Inspect this folder for implementation details when no local source files exist.

- Big picture (what you'll usually find and why)
  - This repository is a lightweight project that depends on the external `flowise` package for the core runtime and flow execution. There is little to no custom app code at the repository root, so changes often involve: adding scripts to `package.json`, creating small integration wrappers, or configuring environment variables.
  - Data flow is driven by Flowise flows and configured LLM providers. API keys and provider configuration live in environment files rather than code.

- Developer workflows (explicit, reproducible commands)
  - Install dependencies (PowerShell):
    ```powershell
    npm ci
    ```
  - If `package.json` contains a `start` script use `npm start`. If there is no `start` script, run CLI binaries from the installed package with npx to inspect or run the Flowise binary:
    ```powershell
    npx flowise --help
    ```
  - To inspect implementation details, open `node_modules/flowise` (this repo delegates most runtime code to that package).

- Project-specific conventions and patterns
  - Environment configuration: look for `.env` and `loginout.env`. Never hard-code API keys — expect them in env files. When adding CI or automation, map these env vars into secure secrets instead of committing them.
  - Minimal local code: because most logic is in `flowise`, prefer small, focused adapters (scripts or config) rather than copying large parts of the library into the repo.

- Integration points and external deps
  - Primary dependency: `flowise@^3.0.10` — check `node_modules/flowise` for supported CLI flags, flow storage formats, and provider integrations.
  - `turndown` is present for HTML-to-Markdown conversions; search repo for its usage before changing behavior.

- How to find more: quick searches the agent should run
  - Search for any `start`/`dev`/`build` scripts: `grep -n "\"scripts\"" -R package.json` (or open `package.json`).
  - Search for flow definitions or saved flows (if they exist): `grep -R "flow" .` starting at repo root.
  - Inspect `node_modules/flowise/README*` and `package.json` to learn available CLIs and hooks.

- Small examples from this repository
  - package.json dependencies (present in repo):
    - `flowise: ^3.0.10`
    - `turndown: ^7.2.2`

- When editing: quick checklist for safe changes
  - Don’t add secrets to source. Use `loginout.env` locally and map to CI secrets for automation.
  - If adding a runtime change, prefer small wrapper scripts and add an explicit `scripts` entry to `package.json` so contributors know how to run it.
  - Update `package-lock.json` when you change dependencies and commit both files.

If anything here is unclear or you want this guidance to include examples for a specific local file (e.g., a starter `start` script or a sample flow directory), tell me which behavior you want and I will update this file.
