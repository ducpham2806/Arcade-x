---
name: arcadex-graphify
description: Use Graphify for ArcadeX code relationships and impact analysis, with local AST extraction, scoped graphs, bounded queries and source verification.
---
# ArcadeX Graphify

Read root `AGENTS.md`, the handoff and one active task card. This project adapter follows the official [Graphify](https://github.com/Graphify-Labs/graphify) CLI; provenance and reproducible commands are in [GRAPHIFY](../../../docs/studio/GRAPHIFY.md). The owner requested this workflow on 2026-11-13.

For structural questions, locate the graph for the active module. Verify its source root, source revision, extraction flags and whether relevant files changed. Query a current graph before broad source reading. With no usable graph, build only the needed code scope using `GRAPHIFY_BACKEND=none` and `extract --code-only`; retain the same root/output for incremental updates. A single literal lookup or files outside graph coverage can use targeted `rg`.

Expand Vietnamese questions into actual symbols/tokens from the graph, not invented labels. Use `query --seed` when the symbol is known, depth 1–2 and budget 700–1500. Inspect source locations in the result and confirm behavior in source/tests. Imports and inferred edges do not prove runtime order, account isolation or deployment health.

Keep generated graphs, caches and local virtual environments ignored. Record revision, scope, node/edge counts, query and limitations in the existing worklog/handoff. Do not add a second session journal. After code changes, refresh the same scope before using its graph again. Installation and CLI availability are machine-local; committed Markdown carries the workflow to the next checkout.
