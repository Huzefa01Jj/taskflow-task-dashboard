
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from "./api.js";

// DOM elements
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");

const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskCategoryInput = document.getElementById("task-category");
const taskPriorityInput = document.getElementById("task-priority");
const taskStatusInput = document.getElementById("task-status");
const taskDueDateInput = document.getElementById("task-due-date");

const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");

const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

let allTasks = [];
let currentFilter = "all";
let currentView = "all";
let toastTimeout;

// Helpers
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function todayString() {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return "No due date";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  const today = todayString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const localTomorrow = new Date(
    tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  if (dateString === today) return "Today";
  if (dateString === localTomorrow) return "Tomorrow";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function statusLabel(status) {
  const labels = {
    todo: "To do",
    "in-progress": "In progress",
    completed: "Completed"
  };

  return labels[status] || "To do";
}

function priorityLabel(priority) {
  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High"
  };

  return labels[priority] || "Medium";
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

// Dashboard statistics
function updateStatistics() {
  const total = allTasks.length;
  const inProgress = allTasks.filter(
    task => task.status === "in-progress"
  ).length;
  const completed = allTasks.filter(
    task => task.status === "completed"
  ).length;

  const overdue = allTasks.filter(task =>
    task.status !== "completed" &&
    task.dueDate &&
    task.dueDate < todayString()
  ).length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-progress").textContent = inProgress;
  document.getElementById("stat-completed").textContent = completed;
  document.getElementById("stat-overdue").textContent = overdue;

  document.getElementById("nav-all-count").textContent = total;
  document.getElementById("tab-all-count").textContent = total;

  document.getElementById("task-count").textContent =
    `${total} ${total === 1 ? "task" : "tasks"}`;

  document.getElementById("completion-summary").textContent =
    total === 0
      ? "Create your first task"
      : `${Math.round((completed / total) * 100)}% of all tasks`;

  document.getElementById("today-label").textContent =
    new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric"
    }).format(new Date()).toUpperCase();
}

// Filtering and searching
function getVisibleTasks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedPriority = priorityFilter.value;

  return allTasks.filter(task => {
    const matchesView =
      currentView !== "today" ||
      task.dueDate === todayString();

    const matchesStatus =
      currentFilter === "all" ||
      task.status === currentFilter;

    const matchesPriority =
      selectedPriority === "all" ||
      task.priority === selectedPriority;

    const searchableText = [
      task.title,
      task.description,
      task.category
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);

    return (
      matchesView &&
      matchesStatus &&
      matchesPriority &&
      matchesSearch
    );
  });
}

function updateEmptyState() {
  const isSearching = searchInput.value.trim().length > 0;

  emptyState.innerHTML = `
    <div class="empty-icon">${isSearching ? "⌕" : "☷"}</div>
    <h3>${isSearching ? "No matching tasks" : "Nothing to show here"}</h3>
    <p>${
      isSearching
        ? "Try another search term or reset your filters."
        : "Create a task to start organizing your work."
    }</p>
    ${
      isSearching
        ? `<button class="secondary-button" data-action="reset-filters" type="button">Reset filters</button>`
        : `<button class="primary-button" data-action="create" type="button">+ Create a task</button>`
    }
  `;
}

// Render task list
function renderTasks() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = visibleTasks.map(task => {
    const isCompleted = task.status === "completed";

    const isOverdue =
      task.status !== "completed" &&
      task.dueDate &&
      task.dueDate < todayString();

    const category = task.category
      ? `<span class="category-pill">${escapeHTML(task.category)}</span>`
      : "";

    const description = task.description
      ? `<p>${escapeHTML(task.description)}</p>`
      : "";

    const dueDate = task.dueDate
      ? `<span class="due-date ${isOverdue ? "is-overdue" : ""}">
          ◷ ${isOverdue ? "Overdue · " : ""}${escapeHTML(formatDate(task.dueDate))}
        </span>`
      : `<span class="due-date">◷ No due date</span>`;

    return `
      <article class="task-row ${isCompleted ? "is-completed" : ""}" data-task-id="${task.id}">
        <div class="task-main">
          <button
            class="task-check ${isCompleted ? "is-checked" : ""}"
            type="button"
            data-action="toggle"
            data-id="${task.id}"
            aria-label="${isCompleted ? "Mark as incomplete" : "Mark as completed"}"
            title="${isCompleted ? "Mark as incomplete" : "Mark as completed"}"
          >✓</button>

          <div class="task-copy">
            <div class="task-title-line">
              <span class="task-title">${escapeHTML(task.title)}</span>
              ${category}
            </div>
            ${description}
          </div>
        </div>

        <div class="task-meta">
          <span class="priority-pill priority-${escapeHTML(task.priority)}">
            <span class="priority-dot"></span>
            ${escapeHTML(priorityLabel(task.priority))}
          </span>

          ${dueDate}

          <span class="status-pill status-${escapeHTML(task.status)}">
            <span></span>${escapeHTML(statusLabel(task.status))}
          </span>
        </div>

        <div class="row-actions">
          <button
            class="row-action"
            type="button"
            data-action="edit"
            data-id="${task.id}"
            aria-label="Edit ${escapeHTML(task.title)}"
            title="Edit task"
          >✎</button>

          <button
            class="row-action delete-action"
            type="button"
            data-action="delete"
            data-id="${task.id}"
            aria-label="Delete ${escapeHTML(task.title)}"
            title="Delete task"
          >⌫</button>
        </div>
      </article>
    `;
  }).join("");

  const hasTasks = visibleTasks.length > 0;

  taskList.hidden = !hasTasks;
  emptyState.hidden = hasTasks;

  if (!hasTasks) updateEmptyState();

  document.getElementById("footer-task-count").textContent =
    `Showing ${visibleTasks.length} of ${allTasks.length} tasks`;

  updateStatistics();
}

// Load data
async function loadTasks() {
  taskList.setAttribute("aria-busy", "true");

  try {
    allTasks = await getTasks();
    renderTasks();
  } catch (error) {
    console.error("Unable to load tasks:", error);
    showToast("Could not load tasks.");
  } finally {
    taskList.setAttribute("aria-busy", "false");
  }
}

// Task dialog
function openCreateDialog() {
  taskForm.reset();

  taskIdInput.value = "";
  taskPriorityInput.value = "medium";
  taskStatusInput.value = "todo";

  document.getElementById("dialog-title").textContent = "Create a task";
  document.getElementById("save-task-btn").textContent = "Save task";

  taskDialog.showModal();
  taskTitleInput.focus();
}

function openEditDialog(id) {
  const task = allTasks.find(item => item.id === Number(id));

  if (!task) {
    showToast("Task not found.");
    return;
  }

  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description || "";
  taskCategoryInput.value = task.category || "";
  taskPriorityInput.value = task.priority;
  taskStatusInput.value = task.status;
  taskDueDateInput.value = task.dueDate || "";

  document.getElementById("dialog-title").textContent = "Edit task";
  document.getElementById("save-task-btn").textContent = "Save changes";

  taskDialog.showModal();
  taskTitleInput.focus();
}

function closeDialog() {
  taskDialog.close();
}

// Save task: create or update
taskForm.addEventListener("submit", async event => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();

  if (!title) {
    taskTitleInput.focus();
    return;
  }

  const taskData = {
    title,
    description: taskDescriptionInput.value.trim(),
    category: taskCategoryInput.value.trim(),
    priority: taskPriorityInput.value,
    status: taskStatusInput.value,
    dueDate: taskDueDateInput.value
  };

  const id = taskIdInput.value;

  const saveButton = document.getElementById("save-task-btn");
  saveButton.disabled = true;

  try {
    if (id) {
      const updated = await updateTask(id, taskData);

      if (!updated) {
        showToast("Task not found.");
        return;
      }

      showToast("Task updated successfully.");
    } else {
      await createTask(taskData);
      showToast("Task created successfully.");
    }

    closeDialog();
    await loadTasks();
  } catch (error) {
    console.error("Unable to save task:", error);
    showToast("Could not save the task.");
  } finally {
    saveButton.disabled = false;
  }
});

// Handle task actions using event delegation
taskList.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "edit") {
    openEditDialog(id);
    return;
  }

  if (action === "toggle") {
    const task = allTasks.find(item => item.id === Number(id));
    if (!task) return;

    const nextStatus =
      task.status === "completed" ? "todo" : "completed";

    try {
      await updateTask(id, { status: nextStatus });
      await loadTasks();
      showToast(
        nextStatus === "completed"
          ? "Task marked as completed."
          : "Task moved back to To do."
      );
    } catch (error) {
      console.error(error);
      showToast("Could not update the task.");
    }

    return;
  }

  if (action === "delete") {
    const task = allTasks.find(item => item.id === Number(id));
    if (!task) return;

    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const deleted = await deleteTask(id);

      if (deleted) {
        await loadTasks();
        showToast("Task deleted successfully.");
      } else {
        showToast("Task could not be found.");
      }
    } catch (error) {
      console.error(error);
      showToast("Could not delete the task.");
    }
  }
});

// Empty-state actions
emptyState.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action === "create") {
    openCreateDialog();
  }

  if (button.dataset.action === "reset-filters") {
    resetFilters();
  }
});

// Filter tabs
document.querySelectorAll(".filter-tab").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    currentView = "all";

    document.querySelectorAll(".filter-tab").forEach(tab => {
      tab.classList.toggle("active", tab === button);
    });

    renderTasks();
  });
});

// Sidebar navigation
document.querySelectorAll(".side-link").forEach(link => {
  link.addEventListener("click", () => {
    currentView = link.dataset.view || "all";
    currentFilter = ["todo", "in-progress", "completed"].includes(currentView)
      ? currentView
      : "all";

    document.querySelectorAll(".side-link").forEach(item => {
      item.classList.toggle("active", item === link);
    });

    document.querySelectorAll(".filter-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.filter === currentFilter);
    });

    renderTasks();
    closeSidebar();
  });
});

// Search and priority filters
searchInput.addEventListener("input", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

function resetFilters() {
  currentFilter = "all";
  currentView = "all";

  searchInput.value = "";
  priorityFilter.value = "all";

  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.filter === "all");
  });

  document.querySelectorAll(".side-link").forEach((link, index) => {
    link.classList.toggle("active", index === 0);
  });

  renderTasks();
}

document.getElementById("clear-filters-top")
  .addEventListener("click", resetFilters);

// Dialog controls
document.getElementById("add-task-btn")
  .addEventListener("click", openCreateDialog);

document.getElementById("close-dialog-btn")
  .addEventListener("click", closeDialog);

document.getElementById("cancel-dialog-btn")
  .addEventListener("click", closeDialog);

// Clicking outside the dialog panel closes it.
taskDialog.addEventListener("click", event => {
  if (event.target === taskDialog) closeDialog();
});

// Mobile sidebar
function openSidebar() {
  sidebar.classList.add("sidebar-open");
  sidebarBackdrop.classList.add("is-visible");
  document.getElementById("mobile-menu-button")
    .setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar.classList.remove("sidebar-open");
  sidebarBackdrop.classList.remove("is-visible");
  document.getElementById("mobile-menu-button")
    .setAttribute("aria-expanded", "false");
}

document.getElementById("mobile-menu-button")
  .addEventListener("click", () => {
    if (sidebar.classList.contains("sidebar-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

sidebarBackdrop.addEventListener("click", closeSidebar);

// Keyboard shortcuts
document.addEventListener("keydown", event => {
  const target = event.target;
  const isTyping =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === "Escape") {
    closeSidebar();
  }
});

// Demo interactions
document.getElementById("notification-btn")
  .addEventListener("click", () => {
    showToast("You're all caught up.");
  });

document.getElementById("profile-btn")
  .addEventListener("click", () => {
    showToast("Signed in as Huzefa · Demo workspace");
  });

// Start the dashboard
loadTasks();
