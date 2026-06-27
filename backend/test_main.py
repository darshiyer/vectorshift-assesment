"""Edge-case tests for the /pipelines/parse endpoint."""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def parse(nodes, edges):
    payload = {
        "nodes": [{"id": n} for n in nodes],
        "edges": [{"source": s, "target": t} for s, t in edges],
    }
    response = client.post("/pipelines/parse", json=payload)
    assert response.status_code == 200
    return response.json()


def test_empty_pipeline_is_a_dag():
    assert parse([], []) == {"num_nodes": 0, "num_edges": 0, "is_dag": True}


def test_linear_chain_is_a_dag():
    result = parse(["a", "b", "c"], [("a", "b"), ("b", "c")])
    assert result == {"num_nodes": 3, "num_edges": 2, "is_dag": True}


def test_cycle_is_not_a_dag():
    result = parse(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])
    assert result["is_dag"] is False
    assert result["num_edges"] == 3


def test_self_loop_is_not_a_dag():
    assert parse(["a"], [("a", "a")])["is_dag"] is False


def test_disconnected_components_are_a_dag():
    result = parse(["a", "b", "c", "d"], [("a", "b"), ("c", "d")])
    assert result["is_dag"] is True


def test_diamond_is_a_dag():
    edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")]
    assert parse(["a", "b", "c", "d"], edges)["is_dag"] is True


def test_isolated_nodes_no_edges():
    result = parse(["a", "b", "c"], [])
    assert result == {"num_nodes": 3, "num_edges": 0, "is_dag": True}


def test_back_edge_creates_cycle():
    edges = [("a", "b"), ("b", "c"), ("d", "b"), ("c", "d")]
    assert parse(["a", "b", "c", "d"], edges)["is_dag"] is False
