
import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Focus on progress, not perfection.",
  "Productivity is never an accident. It is always the result of a commitment.",
  "You don't have to be great to start, but you have to start to be great.",
  "The way to get started is to quit talking and begin doing.",
  "Don't count the days, make the days count.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "It's not about having time, it's about making time.",
  "The only way to do great work is to love what you do."
];

const WelcomeMessage = () => {
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [quote, setQuote] = useState("");
  
  useEffect(() => {
    // Select a random quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    
    // Check if welcome message was dismissed today
    const lastDismissed = localStorage.getItem("tap_welcome_dismissed");
    if (lastDismissed === new Date().toDateString()) {
      setDismissed(true);
    }
  }, []);
  
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("tap_welcome_dismissed", new Date().toDateString());
  };
  
  if (dismissed) return null;
  
  return (
    <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <AlertTitle className="text-blue-800 dark:text-blue-300">
          {getTimeBasedGreeting()}, {profile?.username || 'User'}!
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          {quote}
        </AlertDescription>
      </div>
      <button 
        onClick={handleDismiss}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </button>
    </Alert>
  );
};

export default WelcomeMessage;
