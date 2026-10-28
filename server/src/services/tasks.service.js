
import db from "../database/database.js";

const columns = `
  id,
  title,
  description,
  category,
  priority,
  status,
  due_date AS dueDate,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

export function getAllTasks() {
  return db.prepare(`
    SELECT ${columns}
    FROM tasks
    ORDER BY id DESC
  `).all();
}

export function getTaskById(id) {
  return db.prepare(`
    SELECT ${columns}
    FROM tasks
    WHERE id = ?
  `).get(id);
}

export function createTask(data) {
  const result = db.prepare(`
    INSERT INTO tasks
      (title, description, category, priority, status, due_date)
    VALUES
      (@title, @description, @category, @priority, @status, @dueDate)
  `).run(data);

  return getTaskById(Number(result.lastInsertRowid));
}

export function updateTask(id, data) {
  const columnMap = {
    title: "title",
    description: "description",
    category: "category",
    priority: "priority",
    status: "status",
    dueDate: "due_date"
  };

  const fields = Object.keys(data);

  const assignments = fields.map(
    (field) => `${columnMap[field]} = @${field}`
  );

  assignments.push("updated_at = datetime('now')");

  db.prepare(`
    UPDATE tasks
    SET ${assignments.join(", ")}
    WHERE id = @id
  `).run({ ...data, id });

  return getTaskById(id);
}

export function removeTask(id) {
  return db.prepare(
    "DELETE FROM tasks WHERE id = ?"
  ).run(id).changes > 0;
}
