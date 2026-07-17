from app.schemas.task import TaskPriority, TaskStatus


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_list_get_update_complete_delete_task(client):
    create_payload = {
        "title": "Ship task manager",
        "description": "Build the first production-ready release",
        "priority": TaskPriority.high.value,
    }

    create_response = client.post("/tasks", json=create_payload)
    assert create_response.status_code == 201

    task = create_response.json()
    assert task["id"] > 0
    assert task["title"] == create_payload["title"]
    assert task["status"] == TaskStatus.pending.value
    assert task["priority"] == TaskPriority.high.value

    list_response = client.get("/tasks")
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1

    task_id = task["id"]
    get_response = client.get(f"/tasks/{task_id}")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == task_id

    update_payload = {
        "title": "Ship task manager v2",
        "description": "Add ECS deployment",
        "priority": TaskPriority.medium.value,
        "status": TaskStatus.pending.value,
    }
    update_response = client.put(f"/tasks/{task_id}", json=update_payload)
    assert update_response.status_code == 200
    assert update_response.json()["title"] == update_payload["title"]

    complete_response = client.patch(f"/tasks/{task_id}/complete")
    assert complete_response.status_code == 200
    assert complete_response.json()["status"] == TaskStatus.completed.value

    delete_response = client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/tasks/{task_id}")
    assert missing_response.status_code == 404


def test_validation_errors_are_returned(client):
    response = client.post("/tasks", json={"title": "x"})

    assert response.status_code == 422
