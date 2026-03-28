import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/apiClient";
import {
  fetchUserTasks,
  createTask,
  updateTaskData,
  deleteTaskData,
  completeTaskData
} from "@/utils/taskOperations";

export const useTaskOperations = (tasks, onTasksChange) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const loadTasks = async () => {
    if (!user) return;
    try {
      console.log("Reloading all tasks for user:", user.id);
      const fetchedTasks = await fetchUserTasks(user.id);
      console.log("Fetched tasks:", fetchedTasks.length, "tasks");
      onTasksChange(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    }
  };

  const addTask = async (taskData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add tasks",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTask(user.id, taskData);
      await loadTasks();
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (id, updates) => {
    try {
      await updateTaskData(id, updates);
      await loadTasks();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteTaskData(id);
      await loadTasks();
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const completeTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === "Completed") return;

    try {
      await completeTaskData(id);
      await loadTasks();

      // Refresh the profile to get updated points/streak from the backend
      if (user && profile) {
        await refreshProfile();

        if (task.type === "Suggested") {
          // Dispatch event to notify other components about the streak update
          const updatedStreak = (profile.streak || 0) + 1;
          window.dispatchEvent(new CustomEvent('streak-updated', {
            detail: updatedStreak
          }));
          console.log(`Streak incremented for completing suggested task`);
        }
      }

      toast({
        title: "Success",
        description: "Task completed successfully",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  return {
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
  };
};
