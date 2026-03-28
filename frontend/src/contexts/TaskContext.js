// This file re-exports all task-related types and functions
import { TaskProvider, TaskContext } from "../providers/TaskProvider";
import { useTasks } from "@/hooks/useTasks";

// Re-export everything
export { 
  TaskProvider, 
  TaskContext, 
  useTasks 
};
