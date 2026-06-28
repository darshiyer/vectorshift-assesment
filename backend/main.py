from collections import deque

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="VectorShift Pipeline API")

# The frontend is served from a different origin in development, so allow it
# to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Node(BaseModel):
    id: str
    type: str | None = None


class Edge(BaseModel):
    source: str
    target: str


class Pipeline(BaseModel):
    nodes: list[Node] = []
    edges: list[Edge] = []


class Warning(BaseModel):
    node_id: str
    message: str


class ParseResult(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    # Topological run order (empty when the pipeline has a cycle).
    execution_order: list[str] = []
    # Nodes left in a cycle (empty when the pipeline is a DAG).
    cycle_nodes: list[str] = []
    # Sources (nothing feeds them) and sinks (they feed nothing), excluding
    # fully isolated nodes.
    entry_nodes: list[str] = []
    terminal_nodes: list[str] = []
    isolated_nodes: list[str] = []
    # Longest chain of nodes (pipeline depth); 0 when cyclic.
    max_depth: int = 0
    # Count of nodes per type, e.g. {"llm": 2, "input": 1}.
    node_types: dict[str, int] = {}
    # Non-fatal, actionable issues (still returned for a valid DAG).
    warnings: list[Warning] = []


def analyze(nodes: list[Node], edges: list[Edge]) -> ParseResult:
    """Full structural analysis of the pipeline graph.

    Node ids keep their input order so derived lists are stable. Edges that
    reference unknown nodes are ignored so a malformed payload can't corrupt
    the analysis.
    """
    # dict.fromkeys dedupes while preserving first-seen order — a node is its id,
    # so repeated ids collapse to one.
    order = list(dict.fromkeys(node.id for node in nodes))
    ids = set(order)
    type_by_id = {node.id: node.type for node in nodes}

    adjacency = {node_id: [] for node_id in ids}
    indegree = {node_id: 0 for node_id in ids}
    outdegree = {node_id: 0 for node_id in ids}

    for edge in edges:
        if edge.source in ids and edge.target in ids:
            adjacency[edge.source].append(edge.target)
            indegree[edge.target] += 1
            outdegree[edge.source] += 1

    # Kahn's algorithm: topological order, and whatever's left is a cycle.
    queue = deque(node_id for node_id in order if indegree[node_id] == 0)
    remaining = dict(indegree)
    execution_order: list[str] = []
    while queue:
        node_id = queue.popleft()
        execution_order.append(node_id)
        for neighbor in adjacency[node_id]:
            remaining[neighbor] -= 1
            if remaining[neighbor] == 0:
                queue.append(neighbor)

    is_dag = len(execution_order) == len(ids)
    resolved = set(execution_order)
    cycle_nodes = [node_id for node_id in order if node_id not in resolved]

    # Longest path (in nodes) over the DAG, via DP in topological order.
    max_depth = 0
    if is_dag:
        depth = {node_id: 1 for node_id in ids}
        for node_id in execution_order:
            for neighbor in adjacency[node_id]:
                depth[neighbor] = max(depth[neighbor], depth[node_id] + 1)
        max_depth = max(depth.values(), default=0)

    isolated_nodes = [
        n for n in order if indegree[n] == 0 and outdegree[n] == 0
    ]
    isolated_set = set(isolated_nodes)
    entry_nodes = [n for n in order if indegree[n] == 0 and n not in isolated_set]
    terminal_nodes = [n for n in order if outdegree[n] == 0 and n not in isolated_set]

    node_types: dict[str, int] = {}
    for node_id in order:
        key = type_by_id.get(node_id) or "unknown"
        node_types[key] = node_types.get(key, 0) + 1

    warnings: list[Warning] = []
    for node_id in order:
        node_type = type_by_id.get(node_id)
        if node_type == "output" and indegree[node_id] == 0:
            warnings.append(Warning(node_id=node_id, message=f"Output “{node_id}” has no incoming connection"))
        elif node_type == "input" and outdegree[node_id] == 0:
            warnings.append(Warning(node_id=node_id, message=f"Input “{node_id}” is never used"))
        elif node_id in isolated_set and node_type != "note":
            warnings.append(Warning(node_id=node_id, message=f"“{node_id}” is not connected to anything"))

    return ParseResult(
        num_nodes=len(ids),
        num_edges=len(edges),
        is_dag=is_dag,
        execution_order=execution_order if is_dag else [],
        cycle_nodes=cycle_nodes,
        entry_nodes=entry_nodes,
        terminal_nodes=terminal_nodes,
        isolated_nodes=isolated_nodes,
        max_depth=max_depth,
        node_types=node_types,
        warnings=warnings,
    )


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=ParseResult)
def parse_pipeline(pipeline: Pipeline) -> ParseResult:
    return analyze(pipeline.nodes, pipeline.edges)
