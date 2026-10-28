
const allowedFields = [
  "title",
  "description",
  "category",
  "priority",
  "status",
  "dueDate"
];

function invalid(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function validateTask(input, partial = false) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw invalid("Request body must be a JSON object.");
  }

  const unknown = Object.keys(input).filter(
    (key) => !allowedFields.includes(key)
  );

  if (unknown.length) {
    throw invalid(`Unsupported field: ${unknown[0]}`);
  }

  const has = (key) =>
    Object.prototype.hasOwnProperty.call(input, key);

  const data = {};

  if (!partial || has("title")) {
    const title = String(input.title ?? "").trim();

    if (!title) throw invalid("Title is required.");
    if (title.length > 120) {
      throw invalid("Title must be 120 characters or fewer.");
    }

    data.title = title;
  }

  if (!partial || has("description")) {
    const description = String(input.description ?? "");

    if (description.length > 2000) {
      throw invalid("Description must be 2000 characters or fewer.");
    }

    data.description = description;
  }

  if (!partial || has("category")) {
    const category =
      String(input.category ?? "General").trim() || "General";

    if (category.length > 60) {
      throw invalid("Category must be 60 characters or fewer.");
    }

    data.category = category;
  }

  if (!partial || has("priority")) {
    const priority = String(
      input.priority ?? "medium"
    ).toLowerCase();

    if (!["low", "medium", "high"].includes(priority)) {
      throw invalid("Priority must be low, medium, or high.");
    }

    data.priority = priority;
  }

  if (!partial || has("status")) {
    const status = String(
      input.status ?? "todo"
    ).toLowerCase();

    if (!["todo", "in-progress", "completed"].includes(status)) {
      throw invalid("Invalid task status.");
    }

    data.status = status;
  }

  if (!partial || has("dueDate")) {
    const value = input.dueDate;

    if (value === null || value === "" || value === undefined) {
      data.dueDate = null;
    } else {
      const dueDate = String(value);
      const date = new Date(`${dueDate}T00:00:00.000Z`);

      const valid =
        /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === dueDate;

      if (!valid) {
        throw invalid("Due date must use YYYY-MM-DD format.");
      }

      data.dueDate = dueDate;
    }
  }

  if (partial && Object.keys(data).length === 0) {
    throw invalid("Provide at least one field to update.");
  }

  return data;
}
