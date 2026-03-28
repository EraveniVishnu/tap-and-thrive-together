import api from "@/lib/apiClient";
import { getTodaySuggestedTask } from './suggestedTask';

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

export const fetchUserTasks = async (_userId) => {
  console.log("Fetching tasks via REST API");

  try {
    // Fetch regular tasks
    const regularTasks = await api.get('/api/tasks');
    const mappedRegular = (regularTasks || []).map(mapDbTask);
    console.log("Regular tasks fetched:", mappedRegular.length);

    // Fetch today's suggested task
    const todaySuggested = await getTodaySuggestedTask(_userId);
    const mappedSuggested = todaySuggested ? [todaySuggested] : [];
    console.log("Suggested task:", todaySuggested ? "Found" : "Not found");

    return [...mappedRegular, ...mappedSuggested];
  } catch (e) {
    console.error("Error in fetchUserTasks:", e);
    return [];
  }
};

// Insert a new task via REST API
export const insertTask = async (taskData) => {
  const dbTask = await api.post('/api/tasks', {
    title: taskData.title,
    description: taskData.description,
    type: taskData.type.toLowerCase(),
    priority: taskData.priority.toLowerCase(),
    reminderTime: taskData.reminderTime?.toISOString(),
    dueDate: taskData.dueDate?.toISOString(),
    date: taskData.date?.toISOString().split('T')[0],
    status: (taskData.status || 'Pending').toLowerCase(),
    points: taskData.points,
  });

  return mapDbTask(dbTask);
};
