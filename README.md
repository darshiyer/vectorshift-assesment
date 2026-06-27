# VectorShift — Pipeline Builder

A visual pipeline builder: drag nodes onto a canvas, connect them, and validate
the resulting graph against a FastAPI backend. Built with React + ReactFlow on
the frontend and Python/FastAPI on the backend.

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

### Node abstraction (Part 1)

Every node is described by a plain **config object** — title, icon, category,
fields and handles — in [`src/nodes/nodeConfigs.js`](frontend/src/nodes/nodeConfigs.js).
A single primitive, [`BaseNode`](frontend/src/components/BaseNode.js), turns any
config into a rendered ReactFlow node:

- **Fields** are declarative (`text`, `textarea`, `select`, `number`) and rendered
  by [`NodeField`](frontend/src/components/NodeField.js). Adding a control type is
  a one-line change there, not in every node.
- **Handles** can be a static list *or* a function of the node's live data, which
  is how the Text node grows handles from its variables.
- A [`registry`](frontend/src/nodes/registry.js) derives both the ReactFlow
  `nodeTypes` map and the grouped toolbar from the configs, so a node is
  registered exactly once.

Adding a new node is therefore pure data. The four original nodes (Input, Output,
LLM, Text) were re-expressed as configs, and **five more** — Filter, Math, API
Request, Knowledge Base and Note — were added the same way to demonstrate it.

### Styling (Part 2)

A small, hand-written design-token system
([`src/styles/theme.css`](frontend/src/styles/theme.css)) drives every color,
space, radius and shadow, with per-category accent colors for nodes. No UI
framework — just scoped CSS per component.

### Text node logic (Part 3)

The Text node's textarea **auto-resizes** to its content, and any valid
`{{ variable }}` reference becomes an input handle on the left. Parsing lives in
[`parseVariables.js`](frontend/src/nodes/parseVariables.js): only valid JavaScript
identifiers count, duplicates collapse to one handle, and removing the text
removes the handle.

### Backend integration (Part 4)

Submit posts the live nodes and edges to `POST /pipelines/parse`. The backend
([`backend/main.py`](backend/main.py)) returns `{ num_nodes, num_edges, is_dag }`,
detecting cycles with **Kahn's algorithm**. The result is shown in a dialog with
the counts and the DAG verdict (and a friendly error state if the API is down).

## Beyond the brief

The graph is treated as a first-class citizen, the way a real pipeline product
would:

- **Live validation** — the same DAG analysis the backend runs, executed on the
  client as you build. A header pill shows pipeline health and each node flags
  its own issue (cycle, unconnected output, unused input). See
  [`src/lib/validation.js`](frontend/src/lib/validation.js).
- **Typed handles + connection validation** — handles carry a `dataType`, and
  incompatible, self, or wrong-direction connections are rejected both while
  dragging and on drop. Each target handle takes a single input.
- **Execution order** — `/pipelines/parse` also returns the topological run
  order (and the offending nodes for a cycle), surfaced in the result dialog.
- **Variable autocomplete** — typing `{{` in a Text node suggests the pipeline's
  Input variables, with keyboard navigation.

## Tests

```bash
cd backend && pytest                 # DAG edge cases: cycles, self-loops, disconnected, ...
cd frontend && CI=true npm test      # connection validation + variable parsing
```

## Notable touches

- Pipelines persist to `localStorage`, so a refresh doesn't lose your work.
- Delete a node from its header; connected edges are pruned automatically.
- Live node/edge counts in the header; dark, animated node-editor UI throughout.
