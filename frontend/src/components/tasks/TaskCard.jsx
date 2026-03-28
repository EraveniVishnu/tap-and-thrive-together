
import * as React from "react";
import { useTasks } from "@/contexts/TaskContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash, Check, Clock, CalendarClock, AlertCircle } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { useGamification } from "@/contexts/GamificationContext";
import { useToast } from "@/components/ui/use-toast";



const priorityColors = {
  High: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  Low: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
};

const TaskCard = ({ task }) => {
  const { completeTask, deleteTask } = useTasks();
  const { earnPoints } = useGamification();
  const { toast } = useToast();

  const isCompleted = task.status === "Completed";
  const isMissed = task.status === "Missed";
  
  const formatDueDate = (date) => {
    if (isToday(date)) return "Due: Today";
    if (isTomorrow(date)) return "Due: Tomorrow";
    if (isPast(date)) return "Overdue: " + format(date, "MMM d, yyyy");
    return "Due: " + format(date, "MMM d, yyyy");
  };

  const handleComplete = () => {
    completeTask(task.id);
    earnPoints(task.points);
    
    toast({
      title: "Task completed!",
      description: `You earned ${task.points} points.`,
    });
  };

  const handleDelete = () => {
    if (task.type === "Suggested") {
      toast({
        title: "Cannot delete",
        description: "App-suggested tasks cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    deleteTask(task.id);
    toast({
      title: "Task deleted",
      description: "Your task has been removed.",
    });
  };

  return (
    <Card className={`task-card relative overflow-hidden ${isCompleted ? "task-complete" : ""} ${isMissed ? "border-red-500 bg-red-50/80 dark:bg-red-950/20 shadow-inner" : ""}`}>
      {isMissed && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-600 text-white text-[10px] font-bold py-1 px-8 shadow-sm">
            MISSED
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className={`text-xl ${isMissed ? "text-red-700 dark:text-red-400" : ""}`}>
              {task.title}
            </CardTitle>
            {isMissed && (
              <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
            )}
          </div>
          <Badge className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <CardDescription className="mt-1">
          {task.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge className="flex items-center gap-1">
            {task.type === "Daily" && <Clock className="h-3 w-3" />}
            {task.type === "Occasional" && <CalendarClock className="h-3 w-3" />}
            {task.type}
          </Badge>
          
          {task.type === "Occasional" && task.dueDate && (
            <Badge 
              className={`flex items-center gap-1 border ${isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) ? "text-red-500 border-red-500" : "border-gray-300"}`}
            >
              {formatDueDate(new Date(task.dueDate))}
            </Badge>
          )}
          
          {task.reminderTime && (
            <Badge className="flex items-center gap-1 border border-gray-300">
              Reminder: {format(new Date(task.reminderTime), "h:mm a")}
            </Badge>
          )}
          
          <Badge className="flex items-center gap-1">
            +{task.points} points
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button
            className="btn-destructive text-xs px-2 py-1"
            onClick={handleDelete}
            disabled={task.type === "Suggested" || isCompleted}
          >
            <Trash className="h-3 w-3 mr-1" />
            Delete
          </Button>
          
          <Button
            type="button"
            className={`text-xs ${isCompleted ? "bg-green-600" : isMissed ? "bg-red-600 hover:bg-red-700" : "btn-tap-primary"}`}
            onClick={handleComplete}
            disabled={isCompleted}
          >
            <Check className="h-3 w-3 mr-1" />
            {isCompleted ? "Completed" : isMissed ? "Try Again" : "Complete"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
