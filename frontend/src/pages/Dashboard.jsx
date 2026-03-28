import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, LineChart, LogOut, User, Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PointsDisplay from "@/components/gamification/PointsDisplay";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import StatsOverview from "@/components/progress/StatsOverview";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useGamification } from "@/contexts/GamificationContext";

const Dashboard = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { badges } = useGamification();
  const { toast } = useToast();

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-tap-dark-purple shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">TAP</h1>
              <Separator orientation="vertical" className="mx-4 h-6" />
              <p className="text-gray-600 dark:text-gray-300">Task & Progress Tracker</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <ThemeToggle />
              
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium hidden md:inline-block">
                  {profile?.username || 'User'}
                </span>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline-block">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <WelcomeMessage />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <PointsDisplay />
            <AddTaskForm />
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="daily" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily Tasks
                </TabsTrigger>
                <TabsTrigger value="occasional">Occasional Tasks</TabsTrigger>
                <TabsTrigger value="suggested">Suggested Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="space-y-4">
                <TaskList 
                  title="Daily Tasks" 
                  description="Tasks that repeat every day"
                  type="Daily" 
                />
              </TabsContent>
              
              <TabsContent value="occasional" className="space-y-4">
                <TaskList 
                  title="Occasional Tasks" 
                  description="One-time tasks with specific due dates"
                  type="Occasional" 
                />
              </TabsContent>
              
              <TabsContent value="suggested" className="space-y-4">
                <TaskList 
                  title="Suggested Tasks" 
                  description="AI-suggested tasks for better health and productivity"
                  type="Suggested" 
                />
              </TabsContent>
            </Tabs>
            
            <StatsOverview />
            
            <BadgeGrid badges={badges} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
