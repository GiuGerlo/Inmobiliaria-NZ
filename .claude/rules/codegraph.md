# CodeGraph MCP

Este proyecto tiene un servidor MCP `codegraph_*` configurado. CodeGraph es un grafo SQLite construido con tree-sitter de cada símbolo, edge y archivo. Lecturas sub-ms y devuelven info estructural que grep no puede.

## Cuándo preferir CodeGraph sobre grep/read nativo

Usá CodeGraph para preguntas **estructurales** — qué llama a qué, qué se rompería, dónde se define X, cuál es la firma de X. Usá grep/Read solo para texto literal (strings, comentarios, logs) o cuando ya tenés el archivo abierto.

| Pregunta | Herramienta |
|---|---|
| "¿Dónde está definido X?" / "Buscá símbolo X" | `codegraph_search` |
| "¿Qué llama a la función Y?" | `codegraph_callers` |
| "¿Qué llama Y?" | `codegraph_callees` |
| "¿Cómo X llega/se vuelve Y? / trazá el flujo X → Y" | `codegraph_trace` |
| "¿Qué se rompería si cambio Z?" | `codegraph_impact` |
| "Mostrame la firma / source / docstring de Y" | `codegraph_node` |
| "Dame contexto focalizado de un área" | `codegraph_context` |
| "Ver fuente de varios símbolos relacionados" | `codegraph_explore` |
| "¿Qué archivos hay bajo ruta/" | `codegraph_files` |
| "¿Está sano el índice?" | `codegraph_status` |

## Reglas

- **Responder directo, no delegar.** Para "¿cómo funciona X?" / arquitectura, basta `codegraph_context` + UN `codegraph_explore`. Para flujos ("¿cómo X llega a Y?") empezá con `codegraph_trace`.
- **Confiar en los resultados** — vienen de un parseo AST completo. No re-verificar con grep.
- **No grep primero** para buscar un símbolo por nombre. `codegraph_search` es más rápido y devuelve kind + ubicación + firma en una llamada.
- **No encadenar** `codegraph_search` + `codegraph_node` cuando querés contexto: `codegraph_context` lo hace en una.
- **No loopear `codegraph_node`** sobre N símbolos — `codegraph_explore` devuelve varios cuerpos en una llamada con cap.
- **Lag de índice**: si la respuesta arranca con "⚠️ Some files referenced below were edited...", esos archivos están pending re-index — leer esos archivos con Read. Los que NO están en ese banner son fresh.

## Si `.codegraph/` no existe

El servidor devuelve "not initialized". Preguntar al usuario: *"Este proyecto no tiene CodeGraph inicializado. ¿Corro `codegraph init -i` para construir el índice?"*
