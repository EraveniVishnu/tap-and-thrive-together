import api from "@/lib/apiClient";

export const getTodaySuggestedTask = async (_userId) => {
  console.log("[suggestedTask] Fetching today's suggested task via REST API");

  try {
    const data = await api.get('/api/suggested-tasks/today');

    if (!data) {
      console.log("[suggestedTask] No task returned from API");
      return getFallbackTask(_userId);
    }

    console.log("[suggestedTask] Successfully fetched daily task:", data);

    const isPastDate = data.date && new Date(data.date).toDateString() !== new Date().toDateString() && new Date(data.date) < new Date();
    const status = data.completed 
      ? "Completed" 
      : (isPastDate ? "Missed" : "Pending");

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description || "",
      type: "Suggested",
      priority: "Medium",
      date: data.date ? new Date(data.date) : new Date(),
      createdAt: new Date(),
      status,
      points: data.points,
    };
  } catch (e) {
    console.error("[suggestedTask] Error fetching suggested task:", e);
    return getFallbackTask(_userId);
  }
};

// localStorage fallback when API is unreachable
const getFallbackTask = (_userId) => {
  const localStorageKey = `suggested_task_${_userId}_${new Date().toISOString().split('T')[0]}`;

  const saved = localStorage.getItem(localStorageKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
  }

  const fallback = {
    id: `local-${Date.now()}`,
    userId: _userId,
    title: "Take a healthy break",
    description: "Step away from your work for 5 minutes and stretch",
    type: "Suggested",
    priority: "Medium",
    date: new Date(),
    createdAt: new Date(),
    status: "Pending",
    points: 5,
  };

  localStorage.setItem(localStorageKey, JSON.stringify(fallback));
  console.log("[suggestedTask] Using local fallback task");
  return fallback;
};
