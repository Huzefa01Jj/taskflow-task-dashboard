
import * as taskService from "../services/tasks.service.js";
import { validateTask } from "../validators/task.validator.js";

function parseId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id < 1) {
    const error = new Error("Invalid task ID.");
    error.statusCode = 400;
    throw error;
  }

  return id;
}

export function listTasks(req, res, next) {
  try {
    res.json(taskService.getAllTasks());
  } catch (error) {
    next(error);
  }
}

export function getTask(req, res, next) {
  try {
    const task = taskService.getTaskById(parseId(req.params.id));

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export function createTask(req, res, next) {
  try {
    const data = validateTask(req.body);
    const task = taskService.createTask(data);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export function updateTask(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!taskService.getTaskById(id)) {
      return res.status(404).json({ error: "Task not found." });
    }

    const data = validateTask(req.body, true);
    const task = taskService.updateTask(id, data);

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export function deleteTask(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!taskService.removeTask(id)) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
}
