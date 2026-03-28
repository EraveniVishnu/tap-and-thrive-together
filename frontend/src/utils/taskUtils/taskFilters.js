// These functions filter tasks by different categories
export const getSuggestedTasks = (tasks) => 
  tasks.filter(task => task.type === "Suggested");

export const getDailyTasks = (tasks) => 
  tasks.filter(task => task.type === "Daily");

export const getOccasionalTasks = (tasks) => 
  tasks.filter(task => task.type === "Occasional");

export const getMissedTasks = (tasks) => 
  tasks.filter(task => task.status === "Missed");
