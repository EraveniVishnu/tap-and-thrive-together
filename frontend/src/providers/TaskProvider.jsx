import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskOperations } from "@/hooks/useTaskOperations";

export const TaskContext = createContext(undefined);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  
  const {
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask
  } = useTaskOperations(tasks, setTasks);

  useEffect(() => {
    if (user) {
      loadTasks();
      // Refresh tasks every 30 seconds to sync "Missed" status and other background changes
      const interval = setInterval(loadTasks, 30000);
      return () => clearInterval(interval);
    } else {
      setTasks([]);
    }
  }, [user]);

  const getSuggestedTasks = () => tasks.filter(task => task.type === "Suggested");
  const getDailyTasks = () => tasks.filter(task => task.type === "Daily");
  const getOccasionalTasks = () => tasks.filter(task => task.type === "Occasional");
  const getMissedTasks = () => tasks.filter(task => task.status === "Missed");

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getSuggestedTasks,
        getDailyTasks,
        getOccasionalTasks,
        getMissedTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
