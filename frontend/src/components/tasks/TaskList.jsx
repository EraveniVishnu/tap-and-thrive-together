
import * as React from "react";
import { useState, useEffect } from "react";
import { useTasks } from "@/contexts/TaskContext";
import TaskCard from "./TaskCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown, Calendar, CheckCircle2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const TaskList = ({
  title,
  description,
  type,
  showCompleted = true,
}) => {
  // Get tasks from context
  const { tasks, getSuggestedTasks, getDailyTasks, getOccasionalTasks } = useTasks();
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // Get the appropriate tasks based on type
  useEffect(() => {
    let typeTasks = [];
    if (type === "Suggested") {
      typeTasks = getSuggestedTasks();
    } else if (type === "Daily") {
      typeTasks = getDailyTasks();
    } else if (type === "Occasional") {
      typeTasks = getOccasionalTasks();
    } else {
      typeTasks = tasks;
    }
    
    // Apply filters
    const filtered = typeTasks.filter(task => {
      // Filter by completion status if showCompleted is false
      if (!showCompleted && task.status === "Completed") {
        return false;
      }

      // Filter by priority
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      // Filter by status
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
    
    // Sort tasks based on selected criteria
    const sorted = [...filtered].sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const statusOrder = { Pending: 0, Completed: 1, Missed: 2 };
      
      let comparison = 0;
      
      switch (sortBy) {
        case "priority":
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "created":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "status":
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setFilteredTasks(sorted);
  }, [tasks, type, priorityFilter, statusFilter, sortBy, sortDirection, showCompleted, getSuggestedTasks, getDailyTasks, getOccasionalTasks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button
            className="outline icon-button"
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap gap-4">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No tasks available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
