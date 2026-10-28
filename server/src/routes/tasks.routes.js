
import { Router } from "express";

import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/tasks.controller.js";

const router = Router();

router.get("/", listTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
