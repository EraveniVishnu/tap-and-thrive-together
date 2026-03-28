import api from "@/lib/apiClient";
import { lowercaseFirstLetter } from "./formatters";

function mapDbTask(task) {
  const typeRaw = task.type || 'daily';
  const priorityRaw = task.priority || 'medium';
  const statusRaw = task.status || 'pending';

  return {
    id: task.id,
    userId: task.user_id,
    title: task.title,
    description: task.description || "",
    type: (typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1)),
    priority: (priorityRaw.charAt(0).toUpperCase() + priorityRaw.slice(1)),
    reminderTime: task.reminder_time ? new Date(task.reminder_time) : undefined,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    date: task.date ? new Date(task.date) : undefined,
    createdAt: task.created_at ? new Date(task.created_at) : new Date(),
    status: (statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)),
    points: task.points,
  };
}

export const createTask = async (
  _userId,
  taskData
) => {
  const taskDate =
    taskData.type === "Occasional" && taskData.dueDate
      ? taskData.dueDate.toISOString().split('T')[0]
      : null;

  const dbTask = await api.post('/api/tasks', {
    title: taskData.title,
    description: taskData.description,
    type: lowercaseFirstLetter(taskData.type),
    priority: lowercaseFirstLetter(taskData.priority),
    reminderTime: taskData.reminderTime?.toISOString(),
    dueDate: taskData.dueDate?.toISOString(),
    date: taskDate,
    status: 'pending',
    points: taskData.type === "Suggested" ? 10 : 5,
  });

  return mapDbTask(dbTask);
};

export const updateTaskData = async (id, updates) => {
  // Handle local suggested tasks stored in localStorage
  if (id.startsWith('local-')) {
    const userId = updates.userId || '';
    const localStorageKey = `suggested_task_${userId}_${new Date().toISOString().split('T')[0]}`;
    try {
      const savedTask = localStorage.getItem(localStorageKey);
      if (savedTask) {
        const task = JSON.parse(savedTask);
        localStorage.setItem(localStorageKey, JSON.stringify({ ...task, ...updates }));
      }
    } catch (e) {
      console.error('Error updating local task:', e);
    }
    return;
  }

  const body = {};
  if (updates.title) body.title = updates.title;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.type) body.type = lowercaseFirstLetter(updates.type);
  if (updates.priority) body.priority = lowercaseFirstLetter(updates.priority);
  if (updates.reminderTime) body.reminderTime = updates.reminderTime.toISOString();
  if (updates.dueDate) {
    body.dueDate = updates.dueDate.toISOString();
    if (updates.type === "Occasional") {
      body.date = updates.dueDate.toISOString().split('T')[0];
    }
  }
  if (updates.status) {
    body.status = lowercaseFirstLetter(updates.status);
  }
  if (updates.points) body.points = updates.points;

  await api.put(`/api/tasks/${id}`, body);
};

export const deleteTaskData = async (id) => {
  if (id.startsWith('local-')) {
    // Mark local suggested tasks as completed rather than deleting
    try {
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('suggested_task_') && key.includes(today)) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const task = JSON.parse(saved);
            if (task.id === id) {
              task.status = "Completed";
              localStorage.setItem(key, JSON.stringify(task));
            }
          }
        }
      }
    } catch (e) {
      console.error('Error handling local task deletion:', e);
    }
    return;
  }

  await api.delete(`/api/tasks/${id}`);
};

export const completeTaskData = async (id) => {
  if (id.startsWith('local-')) {
    // Mark local suggested task completed
    try {
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('suggested_task_') && key.includes(today)) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const task = JSON.parse(saved);
            if (task.id === id) {
              task.status = "Completed";
              localStorage.setItem(key, JSON.stringify(task));
            }
          }
        }
      }
    } catch (e) {
      console.error('Error completing local task:', e);
    }
    return;
  }

  // Try completing as suggested task first, then as regular task
  try {
    await api.post(`/api/suggested-tasks/${id}/complete`);
  } catch {
    // Not a suggested task — complete as regular task
    await api.post(`/api/tasks/${id}/complete`);
  }
};
