
// Re-export specific functions from the new modular structure avoiding duplicates
export * from './taskUtils/formatters';

// Selectively re-export from taskQueries
import { fetchUserTasks, insertTask } from './taskUtils/taskQueries';
export { fetchUserTasks, insertTask };

// Selectively re-export functions from taskOperations to avoid conflicts
import { 
  createTask, 
  updateTaskData, 
  deleteTaskData, 
  completeTaskData 
} from './taskUtils/taskOperations';
export { 
  createTask, 
  updateTaskData, 
  deleteTaskData, 
  completeTaskData 
};

// Re-export filters from taskFilters
export * from './taskUtils/taskFilters';
