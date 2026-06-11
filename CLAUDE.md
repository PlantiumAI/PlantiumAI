# PlantiumAI — Regras para agentes de IA

## Vault primeiro (economia de tokens)

1. Antes de pesquisar fora ou reler código extenso, leia `vault/doc/00_MOC.md` e abra **só** a nota específica necessária.
2. Pesquisa externa nova → resuma em `vault/doc/external_cache/` (bullets, sem prosa) usando `TEMPLATE_EXTERNAL.md`.
3. Aprendizado/decisão de arquitetura → nota atômica em `vault/doc/concepts/` (`TEMPLATE_CONCEPT.md`); processo repetível → `vault/doc/workflows/` (`TEMPLATE_WORKFLOW.md`).
4. Toda nota nova deve ser linkada no `00_MOC.md` — siga `vault/doc/workflows/atualizar-moc.md`.
5. Escrita econômica: bullets, 1 ideia por arquivo, sem redundância com o que já existe no vault.

## Git

- Commits exclusivamente como `ThyagoToledo <thyago10a2007@gmail.com>` (config local já aplicada). Verifique a autoria antes de cada push.
- Conventional Commits em português: `tipo(escopo): descrição`.
- Detalhes de ambiente e workaround de DNS do lab: `vault/doc/workflows/setup-dev-windows.md`.

## Estrutura

- `desktop/` — app Tauri 2 + React/TS (núcleo Rust em `src-tauri/`)
- `firmware/` — ESP32 (NDJSON @ 115200 baud)
- `SistemaLegado/` — backend FastAPI antigo, fonte das regras portadas (não evoluir)
- `vault/doc/` — base de conhecimento (este é o cache; mantenha-o atualizado)
