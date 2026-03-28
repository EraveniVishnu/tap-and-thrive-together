
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from "@/contexts/TaskContext";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";

const AddTaskForm = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("Daily");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(undefined);
  const [reminderTime, setReminderTime] = useState("");
  
  const { addTask } = useTasks();
  const { toast } = useToast();

  // Set a default due date for occasional tasks (tomorrow)
  useEffect(() => {
    if (taskType === "Occasional" && !dueDate) {
      setDueDate(addDays(new Date(), 1));
    }
  }, [taskType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your task.",
        variant: "destructive",
      });
      return;
    }
    
    if (taskType === "Occasional" && !dueDate) {
      toast({
        title: "Missing due date",
        description: "Please select a due date for your occasional task.",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    let reminderTimeObj;
    
    if (reminderTime) {
      const [hours, minutes] = reminderTime.split(":").map(Number);
      reminderTimeObj = new Date();
      reminderTimeObj.setHours(hours, minutes, 0, 0);
      
      // If reminder time is for today but already passed
      if (reminderTimeObj < now) {
        // Set reminder for tomorrow at the same time
        reminderTimeObj.setDate(reminderTimeObj.getDate() + 1);
      }
    }
    
    addTask({
      title,
      description,
      type: taskType,
      priority,
      dueDate,
      reminderTime: reminderTimeObj,
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setTaskType("Daily");
    setPriority("Medium");
    setDueDate(undefined);
    setReminderTime("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-tap-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your task..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select
                value={taskType}
                onValueChange={(value) => setTaskType(value)}
              >
                <SelectTrigger id="taskType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Occasional">Occasional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {taskType === "Occasional" && (
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="btn-outline w-full justify-start text-left font-normal"
                    id="dueDate"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time (Optional)</Label>
            <Input
              id="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              className="btn-outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-tap-primary">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskForm;
