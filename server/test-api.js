
const API = "http://localhost:3000/api";

async function check(response, expectedStatus, label) {
  if (response.status !== expectedStatus) {
    const details = await response.text();
    throw new Error(
      `${label}: expected HTTP ${expectedStatus}, received ${response.status}. ${details}`
    );
  }
}

async function runTests() {
  let taskId = null;

  try {
    // 1. Test server health.
    const health = await fetch(`${API}/health`);
    await check(health, 200, "Health check");
    console.log("PASS: Backend health check");

    // 2. Create a task.
    const createResponse = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `API test ${new Date().toISOString()}`,
        description: "Temporary task created by automated testing.",
        category: "Testing",
        priority: "medium",
        status: "todo",
        dueDate: null
      })
    });

    await check(createResponse, 201, "Create task");

    const created = await createResponse.json();
    taskId = created.id;

    if (!taskId) throw new Error("Created task has no ID.");

    console.log("PASS: Create task");

    // 3. Read the created task.
    const readResponse = await fetch(`${API}/tasks/${taskId}`);
    await check(readResponse, 200, "Read task");

    const readTask = await readResponse.json();

    if (readTask.id !== taskId) {
      throw new Error("The returned task ID does not match.");
    }

    console.log("PASS: Read task");

    // 4. Update the task.
    const updateResponse = await fetch(`${API}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });

    await check(updateResponse, 200, "Update task");

    const updated = await updateResponse.json();

    if (updated.status !== "completed") {
      throw new Error("The task status was not updated.");
    }

    console.log("PASS: Update task");

    // 5. Delete the task.
    const deleteResponse = await fetch(`${API}/tasks/${taskId}`, {
      method: "DELETE"
    });

    await check(deleteResponse, 200, "Delete task");
    taskId = null;

    console.log("PASS: Delete task");

    // 6. Verify the deleted task no longer exists.
    const missingResponse = await fetch(
      `${API}/tasks/${created.id}`
    );

    await check(missingResponse, 404, "Deleted task check");

    console.log("PASS: Deleted task returns HTTP 404");
    console.log("\nAll API tests passed.");
  } finally {
    // Clean up the test task if a test fails partway through.
    if (taskId !== null) {
      await fetch(`${API}/tasks/${taskId}`, {
        method: "DELETE"
      }).catch(() => {});
    }
  }
}

runTests().catch((error) => {
  console.error("\nAPI tests failed:", error.message);
  process.exitCode = 1;
});
