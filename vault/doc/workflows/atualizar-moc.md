---
tags: [workflow, documentation]
updated: 2026-06-11
---

## Objetivo

Manter o `00_MOC.md` como índice fiel do vault: toda nota existente listada, nenhum link quebrado.

## Pré-requisitos

- Nota nova já criada em `concepts/`, `workflows/` ou `external_cache/`
- Vault aberto na raiz `vault/doc/`

## Passos

1. Abra `00_MOC.md`
2. Adicione o link `[[pasta/nome-da-nota]]` na seção correspondente:
   - `concepts/` → Conceitos & Tecnologias
   - `workflows/` → Workflows & Processos
   - `external_cache/` → Cache Externo
3. Nota obsoleta? Mova o link para a seção Archive (não delete)
4. Atualize o campo `updated:` do frontmatter e a linha **Última revisão**
5. Commit + push (`docs(vault): atualiza MOC`)

## Validação

- Todo arquivo `.md` do vault (exceto templates) tem link no MOC?
- Todo link do MOC aponta para arquivo que existe?
- Data de revisão atualizada?

## Troubleshooting

- Link quebrado no MOC → criar a nota faltante ou mover o link para Archive
- Nota sem seção óbvia → revisar o escopo da nota; provavelmente está misturando ideias
