# VectorShift — Pipeline Studio

A visual pipeline builder: drag nodes onto a canvas, connect them, and validate
the resulting graph against a FastAPI backend. The frontend is a self-contained
React canvas (drag/connect/pan/zoom/minimap); the backend is Python/FastAPI.

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

### Frontend ([`src/PipelineStudio.js`](frontend/src/PipelineStudio.js))

A single React component implements the whole canvas: a node registry (`DEFS`)
that describes each node type as data (title, category, input/output ports,
fields), plus a hand-rolled canvas engine for panning, zooming, node dragging,
wiring nodes together, a live minimap and an empty state. Styling lives in
[`PipelineStudio.css`](frontend/src/PipelineStudio.css) as a CSS-variable design
system (Space Grotesk / JetBrains Mono, per-category accent colors, gradients).

- **Node abstraction:** new node types are added by extending the `DEFS` map —
  Input, Output, LLM, Text, Filter, Math, API Request, Knowledge Base and Note
  are all driven from it, so no node has bespoke layout code.
- **Text node:** the template field auto-resizes, and typing `{{` opens a
  variable autocomplete sourced from the pipeline's Input nodes.
- **Live validation:** the graph is analyzed on every change (Tarjan's SCC for
  cycles, plus unconnected-node warnings); the header pill and per-node error
  glow update instantly.

### Backend ([`backend/main.py`](backend/main.py))

`POST /pipelines/parse` accepts `{ nodes, edges }` and returns
`{ num_nodes, num_edges, is_dag, execution_order, cycle_nodes }`. Cycle detection
and the topological run order use **Kahn's algorithm** (O(V + E)). CORS is
enabled for the dev frontend.

### Submit flow

Clicking **Submit Pipeline** posts the live nodes and edges to the backend and
shows the verdict modal — node/edge counts, valid/invalid DAG, and the execution
order (or the offending cycle), with a friendly error state if the API is down.

## Tests

```bash
cd backend && pytest        # 26 cases: cycles, self-loops, disconnected graphs,
                            # duplicate ids, malformed payloads, perf, topo invariant
```
