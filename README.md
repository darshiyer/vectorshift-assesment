# VectorShift — Pipeline Studio

A visual pipeline builder: drag nodes onto a canvas, connect them, and validate
the resulting graph against a FastAPI backend. The frontend is React + ReactFlow
+ Zustand; the backend is Python/FastAPI.

## Running locally

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload          # http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install
npm start                          # http://localhost:3000
```

The frontend talks to the backend at `http://localhost:8000` by default; override
with `REACT_APP_API_BASE` if needed.

## How it's built

### Node abstraction ([`src/nodes/BaseNode.js`](frontend/src/nodes/BaseNode.js))

Every node type (Input, Output, LLM, Text, Filter, Math, API Request, Knowledge
Base, Note) renders through one `BaseNode` primitive: it takes a title, icon,
category color, and typed input/output ports, and lays out the header, port
grid and ReactFlow `Handle`s consistently. Each node file just supplies its
fields and category — no per-node layout code.

### Styling ([`src/index.css`](frontend/src/index.css))

A CSS-variable design system (Space Grotesk / JetBrains Mono, per-category
accent colors, gradients, motion curves) drives every surface, including
overrides on ReactFlow's own node/handle/controls/minimap classes so the canvas
matches the rest of the UI.

### Text node ([`src/nodes/textNode.js`](frontend/src/nodes/textNode.js))

The template field auto-resizes to its content. Typing `{{` opens a variable
autocomplete sourced from the pipeline's Input node names; `{{ variable }}`
references become extra input ports on the node automatically.

### Live validation ([`src/submit.js`](frontend/src/submit.js))

The header pill and node error glow are driven by a client-side analysis
(Tarjan's SCC for cycles, unconnected-node detection) that runs as the graph
changes — independent of the backend call, so feedback is instant.

### Backend ([`backend/main.py`](backend/main.py))

`POST /pipelines/parse` accepts `{ nodes, edges }` (each node optionally typed)
and returns a full structural analysis:

```json
{
  "num_nodes": 4, "num_edges": 3, "is_dag": true,
  "execution_order": ["input_1", "text_1", "llm_1", "output_1"],
  "cycle_nodes": [], "entry_nodes": ["input_1", "text_1"],
  "terminal_nodes": ["output_1"], "isolated_nodes": [],
  "max_depth": 3, "node_types": {"input": 1, "text": 1, "llm": 1, "output": 1},
  "warnings": []
}
```

Cycle detection and the topological order use **Kahn's algorithm** (O(V+E));
`max_depth` is the longest chain via DP over the topological order. `warnings`
flags unconnected outputs, unused inputs, and isolated nodes — returned even
when the pipeline is a valid DAG.

### Submit flow

Clicking **Submit Pipeline** posts the live graph and renders the verdict
modal: node/edge/depth stats, a **Composition** breakdown by node type, the
**Flow** (entry → terminal nodes), any **warnings**, and the execution order
(or the cycle detail if invalid) — with a friendly error state if the API is
down.

## Tests

```bash
cd backend && pytest        # 33 cases: cycles, self-loops, disconnected graphs,
                            # duplicate ids, malformed payloads, perf, topo
                            # invariant, depth/composition/flow/warnings
cd frontend && CI=true npm test
```
