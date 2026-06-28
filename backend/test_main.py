"""Contract and edge-case tests for /pipelines/parse.

Grouped by intent: correctness, structural edge cases, malformed input, the HTTP
contract, an invariant check, and performance.
"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def parse(nodes, edges, status=200):
    payload = {
        "nodes": [{"id": n} for n in nodes],
        "edges": [{"source": s, "target": t} for s, t in edges],
    }
    response = client.post("/pipelines/parse", json=payload)
    assert response.status_code == status, response.text
    return response.json() if status == 200 else None


# --- correctness -----------------------------------------------------------

def test_empty_pipeline():
    result = parse([], [])
    assert result["num_nodes"] == 0
    assert result["num_edges"] == 0
    assert result["is_dag"] is True
    assert result["execution_order"] == []
    assert result["cycle_nodes"] == []
    assert result["max_depth"] == 0
    assert result["warnings"] == []


def test_single_node():
    result = parse(["a"], [])
    assert result["is_dag"] is True
    assert result["execution_order"] == ["a"]


def test_linear_chain():
    result = parse(["a", "b", "c"], [("a", "b"), ("b", "c")])
    assert result["num_nodes"] == 3
    assert result["num_edges"] == 2
    assert result["is_dag"] is True
    assert result["execution_order"] == ["a", "b", "c"]


def test_cycle():
    result = parse(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])
    assert result["is_dag"] is False
    assert result["execution_order"] == []
    assert set(result["cycle_nodes"]) == {"a", "b", "c"}


def test_self_loop():
    result = parse(["a"], [("a", "a")])
    assert result["is_dag"] is False
    assert result["cycle_nodes"] == ["a"]


def test_disconnected_components():
    assert parse(["a", "b", "c", "d"], [("a", "b"), ("c", "d")])["is_dag"] is True


def test_diamond():
    edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")]
    result = parse(["a", "b", "c", "d"], edges)
    assert result["is_dag"] is True
    assert result["execution_order"][0] == "a"
    assert result["execution_order"][-1] == "d"


def test_isolated_nodes():
    result = parse(["a", "b", "c"], [])
    assert result["is_dag"] is True
    assert result["execution_order"] == ["a", "b", "c"]


def test_back_edge_cycle():
    edges = [("a", "b"), ("b", "c"), ("d", "b"), ("c", "d")]
    result = parse(["a", "b", "c", "d"], edges)
    assert result["is_dag"] is False
    assert "a" not in result["cycle_nodes"]
    assert set(result["cycle_nodes"]) == {"b", "c", "d"}


def test_two_separate_cycles():
    edges = [("a", "b"), ("b", "a"), ("c", "d"), ("d", "c")]
    result = parse(["a", "b", "c", "d"], edges)
    assert result["is_dag"] is False
    assert set(result["cycle_nodes"]) == {"a", "b", "c", "d"}


# --- structural edge cases -------------------------------------------------

def test_duplicate_node_id_counts_unique_and_is_not_a_cycle():
    result = parse(["a", "a"], [])
    assert result["num_nodes"] == 1
    assert result["is_dag"] is True
    assert result["execution_order"] == ["a"]


def test_duplicate_edges_counted_raw_but_still_acyclic():
    result = parse(["a", "b"], [("a", "b"), ("a", "b")])
    assert result["num_edges"] == 2
    assert result["is_dag"] is True


def test_edge_to_unknown_node_is_ignored():
    result = parse(["a"], [("a", "ghost")])
    assert result["is_dag"] is True
    assert result["execution_order"] == ["a"]


def test_edge_from_unknown_node_is_ignored():
    assert parse(["a"], [("ghost", "a")])["is_dag"] is True


def test_empty_string_and_unicode_ids():
    result = parse(["", "λ", "a"], [("", "λ"), ("λ", "a")])
    assert result["is_dag"] is True
    assert result["execution_order"] == ["", "λ", "a"]


def test_is_dag_is_a_real_boolean():
    assert client.post(
        "/pipelines/parse", json={"nodes": [{"id": "a"}], "edges": []}
    ).json()["is_dag"] is True


# --- malformed payloads ----------------------------------------------------

def test_missing_keys_default_to_empty():
    assert parse([], []) == client.post("/pipelines/parse", json={}).json()


def test_nodes_not_a_list_is_rejected():
    assert client.post("/pipelines/parse", json={"nodes": "x", "edges": []}).status_code == 422


def test_node_without_id_is_rejected():
    assert client.post("/pipelines/parse", json={"nodes": [{"k": 1}], "edges": []}).status_code == 422


def test_edge_without_target_is_rejected():
    payload = {"nodes": [{"id": "a"}], "edges": [{"source": "a"}]}
    assert client.post("/pipelines/parse", json=payload).status_code == 422


def test_non_string_id_is_rejected():
    assert client.post("/pipelines/parse", json={"nodes": [{"id": 5}], "edges": []}).status_code == 422


def test_unknown_payload_fields_are_ignored():
    payload = {"nodes": [{"id": "a", "type": "llm"}], "edges": [], "junk": 1}
    assert client.post("/pipelines/parse", json=payload).json()["num_nodes"] == 1


# --- HTTP contract ---------------------------------------------------------

def test_get_method_not_allowed():
    assert client.get("/pipelines/parse").status_code == 405


def test_root_health_check():
    assert client.get("/").json() == {"Ping": "Pong"}


# --- invariant -------------------------------------------------------------

def test_execution_order_is_a_valid_topological_order():
    # For every edge u -> v in an acyclic graph, u must run before v.
    nodes = ["a", "b", "c", "d", "e"]
    edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d"), ("d", "e")]
    result = parse(nodes, edges)
    assert result["is_dag"] is True
    position = {node_id: i for i, node_id in enumerate(result["execution_order"])}
    for source, target in edges:
        assert position[source] < position[target]


# --- performance -----------------------------------------------------------

def test_large_linear_chain_is_fast():
    n = 20000
    nodes = [str(i) for i in range(n)]
    edges = [(str(i), str(i + 1)) for i in range(n - 1)]
    result = parse(nodes, edges)
    assert result["is_dag"] is True
    assert result["num_nodes"] == n


# --- structural analysis (new fields) --------------------------------------

def typed(nodes, edges, status=200):
    """nodes: list of (id, type) tuples."""
    payload = {
        "nodes": [{"id": i, "type": t} for i, t in nodes],
        "edges": [{"source": s, "target": d} for s, d in edges],
    }
    r = client.post("/pipelines/parse", json=payload)
    assert r.status_code == status, r.text
    return r.json()


def test_max_depth_linear_chain():
    result = parse(["a", "b", "c", "d"], [("a", "b"), ("b", "c"), ("c", "d")])
    assert result["max_depth"] == 4


def test_max_depth_diamond():
    edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")]
    assert parse(["a", "b", "c", "d"], edges)["max_depth"] == 3


def test_max_depth_zero_for_cycle():
    assert parse(["a", "b"], [("a", "b"), ("b", "a")])["max_depth"] == 0


def test_entry_terminal_and_isolated_nodes():
    # a -> b -> c, plus a lone node d
    result = parse(["a", "b", "c", "d"], [("a", "b"), ("b", "c")])
    assert result["entry_nodes"] == ["a"]
    assert result["terminal_nodes"] == ["c"]
    assert result["isolated_nodes"] == ["d"]


def test_node_type_breakdown():
    result = typed(
        [("in1", "input"), ("llm1", "llm"), ("llm2", "llm"), ("out1", "output")],
        [("in1", "llm1"), ("llm1", "llm2"), ("llm2", "out1")],
    )
    assert result["node_types"] == {"input": 1, "llm": 2, "output": 1}


def test_warns_on_unconnected_output_and_unused_input():
    result = typed([("in1", "input"), ("out1", "output")], [])
    messages = {w["node_id"]: w["message"] for w in result["warnings"]}
    assert "in1" in messages and "never used" in messages["in1"]
    assert "out1" in messages and "no incoming" in messages["out1"]


def test_note_node_is_not_warned_when_isolated():
    result = typed([("note1", "note")], [])
    assert result["warnings"] == []
    assert result["isolated_nodes"] == ["note1"]
