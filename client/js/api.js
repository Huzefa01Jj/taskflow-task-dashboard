
const API_BASE_URL = "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      cache: "no-store",
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Make sure the server is running."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

export async function getTasks() {
  return request("/tasks");
}

export async function createTask(taskData) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData)
  });
}

export async function updateTask(id, updates) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  });
}

export async function deleteTask(id) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
