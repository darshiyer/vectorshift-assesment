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


def is_dag(nodes: list[Node], edges: list[Edge]) -> bool:
    """Return True if the graph is acyclic, using Kahn's algorithm.

    Edges that reference unknown nodes are ignored so a malformed payload can't
    make a valid pipeline look cyclic.
    """
    ids = {node.id for node in nodes}
    adjacency = {node_id: [] for node_id in ids}
    indegree = {node_id: 0 for node_id in ids}

    for edge in edges:
        if edge.source in ids and edge.target in ids:
            adjacency[edge.source].append(edge.target)
            indegree[edge.target] += 1

    queue = deque(node_id for node_id in ids if indegree[node_id] == 0)
    visited = 0

    while queue:
        node_id = queue.popleft()
        visited += 1
        for neighbor in adjacency[node_id]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    # If every node was processed, no cycle remained.
    return visited == len(ids)


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=ParseResult)
def parse_pipeline(pipeline: Pipeline) -> ParseResult:
    return ParseResult(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag(pipeline.nodes, pipeline.edges),
    )
