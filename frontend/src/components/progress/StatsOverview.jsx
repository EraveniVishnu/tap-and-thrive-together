
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/contexts/TaskContext";
import { useGamification } from "@/contexts/GamificationContext";
import { CheckCircle, Clock, BarChart2, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const StatsOverview = () => {
  const { tasks } = useTasks();
  const { points, streak, leaderboardPosition } = useGamification();

  // Calculate task completion stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "Completed").length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate stats by task type
  const dailyTasksCompleted = tasks.filter(
    task => task.type === "Daily" && task.status === "Completed"
  ).length;
  const dailyTasksTotal = tasks.filter(task => task.type === "Daily").length;
  
  const suggestedTasksCompleted = tasks.filter(
    task => task.type === "Suggested" && task.status === "Completed"
  ).length;
  const suggestedTasksTotal = tasks.filter(task => task.type === "Suggested").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Task Completion
          </CardTitle>
          <CardDescription>Your progress completing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="mt-1 text-xs text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Daily Tasks</span>
                <span className="text-sm font-medium">
                  {dailyTasksTotal > 0 
                    ? Math.round((dailyTasksCompleted / dailyTasksTotal) * 100) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={dailyTasksTotal > 0 ? (dailyTasksCompleted / dailyTasksTotal) * 100 : 0} 
                className="h-2" 
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {dailyTasksCompleted} of {dailyTasksTotal} daily tasks
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Suggested Tasks</span>
                <span className="text-sm font-medium">
                  {suggestedTasksTotal > 0 
                    ? Math.round((suggestedTasksCompleted / suggestedTasksTotal) * 100) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={suggestedTasksTotal > 0 ? (suggestedTasksCompleted / suggestedTasksTotal) * 100 : 0} 
                className="h-2" 
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {suggestedTasksCompleted} of {suggestedTasksTotal} suggested tasks
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-500" />
            Performance Overview
          </CardTitle>
          <CardDescription>Your overall performance stats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-blue-500 mb-1" />
                <span className="text-2xl font-bold">{streak}</span>
                <span className="text-xs text-gray-500">Day Streak</span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex flex-col items-center">
                <BarChart2 className="h-8 w-8 text-purple-500 mb-1" />
                <span className="text-2xl font-bold">{points}</span>
                <span className="text-xs text-gray-500">Total Points</span>
              </div>
            </div>
            
            {leaderboardPosition && (
              <div className="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Leaderboard Rank</div>
                    <div className="text-xs text-gray-500">Out of all users</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">#{leaderboardPosition}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
