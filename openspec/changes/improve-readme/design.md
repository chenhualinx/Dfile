## Context

DFile currently has no README.md at the project root. The project has:
- A bilingual UI (zh-CN/en-US) managed through i18next with YAML translation sources compiled to JSON
- A Tauri v2 desktop application with Rust backend (MTP protocol via mtp-rs crate)
- A React + TypeScript + Vite frontend with Tailwind CSS
- No contributing or onboarding documentation for new developers

## Goals / Non-Goals

**Goals:**
- Create a single README.md at the project root
- Cover both English and Chinese audiences with bilingual sections
- Document the project purpose, features, tech stack, prerequisites, build/run instructions, and basic usage
- Document the i18n workflow for translators
- Include license information from the existing LICENSE file

**Non-Goals:**
- Adding screenshots or media (placeholders only)
- Creating separate README files per language
- Writing detailed API documentation or architecture docs
- Updating any source code or configuration

## Decisions

- **Bilingual format**: Use top-then-bottom pattern (English section first, then Chinese translation) rather than inline side-by-side, to keep the file clean and easy to maintain
- **Single README.md**: One file per project convention. The existing i18n system handles UI translations; the README targets developers and users who need project context
- **Build instructions**: Use both `bun` and `cargo` commands as the project uses both Node.js and Rust toolchains
- **Reference translations**: Align terminology with `src/i18n/translations/*.yaml` to keep project glossary consistent

## Risks / Trade-offs

- README may become outdated if project structure changes significantly → Mitigation: Keep instructions simple and reference standard tools (cargo, bun, tauri)
- Bilingual content doubles the file length → Mitigation: Acceptable trade-off for accessibility; keep each section concise
