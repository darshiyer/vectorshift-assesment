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


class Edge(BaseModel):
    source: str
    target: str


class Pipeline(BaseModel):
    nodes: list[Node] = []
    edges: list[Edge] = []


class ParseResult(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    # Topological run order (empty when the pipeline has a cycle).
    execution_order: list[str] = []
    # Nodes left in a cycle (empty when the pipeline is a DAG).
    cycle_nodes: list[str] = []


def analyze(nodes: list[Node], edges: list[Edge]) -> tuple[bool, list[str], list[str]]:
    """Kahn's algorithm: returns (is_dag, execution_order, cycle_nodes).

    Node ids keep their input order so the execution order is stable. Edges that
    reference unknown nodes are ignored so a malformed payload can't make a valid
    pipeline look cyclic.
    """
    # dict.fromkeys dedupes while keeping first-seen order — guards against a
    # malformed payload with a repeated node id throwing off the node count
    # used in the is_dag check below.
    order = list(dict.fromkeys(node.id for node in nodes))
    ids = set(order)
    adjacency = {node_id: [] for node_id in ids}
    indegree = {node_id: 0 for node_id in ids}

    for edge in edges:
        if edge.source in ids and edge.target in ids:
            adjacency[edge.source].append(edge.target)
            indegree[edge.target] += 1

    queue = deque(node_id for node_id in order if indegree[node_id] == 0)
    execution_order: list[str] = []

    while queue:
        node_id = queue.popleft()
        execution_order.append(node_id)
        for neighbor in adjacency[node_id]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    is_dag = len(execution_order) == len(ids)
    resolved = set(execution_order)
    cycle_nodes = [node_id for node_id in order if node_id not in resolved]

    return is_dag, (execution_order if is_dag else []), cycle_nodes


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=ParseResult)
def parse_pipeline(pipeline: Pipeline) -> ParseResult:
    is_dag, execution_order, cycle_nodes = analyze(pipeline.nodes, pipeline.edges)
    return ParseResult(
        # A node is identified by its id, so two entries sharing an id are the
        # same node — count unique ids to stay consistent with the analysis.
        num_nodes=len({node.id for node in pipeline.nodes}),
        num_edges=len(pipeline.edges),
        is_dag=is_dag,
        execution_order=execution_order,
        cycle_nodes=cycle_nodes,
    )
