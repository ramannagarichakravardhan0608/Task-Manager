const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const statusInput = document.getElementById("status");
const statusGroup = document.getElementById("statusGroup");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const refreshBtn = document.getElementById("refreshBtn");
const alertContainer = document.getElementById("alertContainer");
const healthBadge = document.getElementById("healthBadge");

let isEditing = false;

function showAlert(message, variant = "success") {
  alertContainer.innerHTML = `
    <div class="alert alert-${variant} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetForm() {
  isEditing = false;
  taskIdInput.value = "";
  taskForm.reset();
  priorityInput.value = "medium";
  statusInput.value = "pending";
  statusGroup.classList.add("d-none");
  formTitle.textContent = "Create Task";
  submitBtn.textContent = "Create Task";
  cancelBtn.classList.add("d-none");
}

function enterEditMode(task) {
  isEditing = true;
  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description ?? "";
  priorityInput.value = task.priority;
  statusInput.value = task.status;
  statusGroup.classList.remove("d-none");
  formTitle.textContent = `Edit Task #${task.id}`;
  submitBtn.textContent = "Update Task";
  cancelBtn.classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function taskCard(task) {
  const completed = task.status === "completed";
  return `
    <article class="task-card">
      <div class="d-flex justify-content-between gap-3">
        <div>
          <h3 class="h5 mb-1">${escapeHtml(task.title)}</h3>
          <p class="text-secondary mb-0">${escapeHtml(task.description || "No description provided.")}</p>
        </div>
        <span class="badge rounded-pill status-badge ${task.status} text-uppercase align-self-start">${task.status}</span>
      </div>
      <div class="task-meta">
        <span class="badge rounded-pill priority-badge ${task.priority}">Priority: ${task.priority}</span>
        <span class="text-secondary small">ID: ${task.id}</span>
        <span class="text-secondary small">Created: ${new Date(task.created_at).toLocaleString()}</span>
      </div>
      <div class="task-actions">
        <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${task.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${task.id}">Delete</button>
        <button class="btn btn-sm btn-success" data-action="complete" data-id="${task.id}" ${completed ? "disabled" : ""}>Mark Completed</button>
      </div>
    </article>
  `;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Unexpected error";
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadHealth() {
  try {
    const data = await apiRequest("/health");
    healthBadge.className = "badge rounded-pill text-bg-success px-3 py-2";
    healthBadge.textContent = `Health: ${data.status}`;
  } catch {
    healthBadge.className = "badge rounded-pill text-bg-danger px-3 py-2";
    healthBadge.textContent = "Health check failed";
  }
}

async function loadTasks() {
  taskList.innerHTML = `<div class="text-secondary">Loading tasks...</div>`;
  const data = await apiRequest("/tasks");
  taskCount.textContent = `${data.total} task${data.total === 1 ? "" : "s"} found`;
  if (!data.items.length) {
    taskList.innerHTML = `
      <div class="text-center py-5 text-secondary">
        <p class="h5 mb-2">No tasks yet</p>
        <p class="mb-0">Create your first task using the form on the left.</p>
      </div>
    `;
    return;
  }
  taskList.innerHTML = data.items.map(taskCard).join("");
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!taskForm.checkValidity()) {
    taskForm.classList.add("was-validated");
    return;
  }

  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim() || null,
    priority: priorityInput.value,
    status: statusInput.value,
  };

  try {
    if (isEditing) {
      await apiRequest(`/tasks/${taskIdInput.value}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showAlert("Task updated successfully.");
    } else {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showAlert("Task created successfully.");
    }

    resetForm();
    taskForm.classList.remove("was-validated");
    await loadTasks();
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  try {
    if (action === "edit") {
      const task = await apiRequest(`/tasks/${id}`);
      enterEditMode(task);
      return;
    }

    if (action === "delete") {
      if (!window.confirm("Delete this task?")) {
        return;
      }
      await apiRequest(`/tasks/${id}`, { method: "DELETE" });
      showAlert("Task deleted successfully.");
      await loadTasks();
      return;
    }

    if (action === "complete") {
      await apiRequest(`/tasks/${id}/complete`, { method: "PATCH" });
      showAlert("Task marked as completed.");
      await loadTasks();
    }
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

refreshBtn.addEventListener("click", async () => {
  await loadTasks();
});

document.addEventListener("DOMContentLoaded", async () => {
  resetForm();
  await Promise.all([loadHealth(), loadTasks()]);
});
