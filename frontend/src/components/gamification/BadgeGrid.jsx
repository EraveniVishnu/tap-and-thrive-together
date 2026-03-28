
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Award, Lock, Flame, Star, Trophy, Sun, Moon, 
  Zap, Target, Crown, Medal, Diamond, Rocket, Sunrise
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge as UIBadge } from "@/components/ui/badge";

const getBadgeIcon = (id, earned) => {
  const baseContainer = "relative flex items-center justify-center w-16 h-16 rounded-full mb-2 mx-auto";
  const iconBase = "w-8 h-8";

  if (!earned) {
    return (
      <div className={`${baseContainer} bg-gray-100 dark:bg-gray-800 shadow-inner`}>
        <Lock className={`${iconBase} text-gray-400 dark:text-gray-500`} />
      </div>
    );
  }

  // Different color themes for distinct badges
  const styles = {
    first_task: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-700/50', icon: Star },
    streak_3: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-700/50', icon: Flame },
    streak_7: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700/50', icon: Zap },
    streak_14: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-700/50', icon: Target },
    streak_21: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-700/50', icon: Crown },
    streak_30: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700/50', icon: Medal },
    streak_60: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-700/50', icon: Diamond },
    streak_90: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-700/50', icon: Rocket },
    early_bird: { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-700/50', icon: Sunrise },
    night_owl: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-700/50', icon: Moon },
    suggested_master: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700/50', icon: Trophy },
  };

  const badgeStyle = styles[id] || { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-700/50', icon: Award };
  const IconComponent = badgeStyle.icon;

  return (
    <div className={`${baseContainer} ${badgeStyle.bg} border-2 ${badgeStyle.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      <IconComponent className={`${iconBase} ${badgeStyle.text} drop-shadow-sm`} />
    </div>
  );
};

const BadgeGrid = ({ badges }) => {
  // Helper function to format date safely
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    try {
      return new Date(dateValue).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date unavailable";
    }
  };

  // Get image URL for a badge (with fallback)
  // Not used anymore as we switched to Lucide icons
  // Keeping function signature for backward compatibility if needed elsewhere
  const getBadgeImageUrl = (badge) => {
    return `/badges/achievement-default.png`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Achievements
        </CardTitle>
        <CardDescription>
          Collect badges by completing challenges and maintaining streaks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`group flex flex-col items-center p-4 rounded-xl border ${
                      badge.earned
                        ? "border-blue-200 bg-blue-50/50 badge-earned hover:shadow-md transition-all shadow-sm dark:bg-slate-800/80 dark:border-slate-700"
                        : "border-gray-100 bg-gray-50/50 opacity-70 hover:opacity-100 transition-opacity dark:bg-gray-900/40 dark:border-gray-800/80"
                    }`}
                  >
                    <div className="relative flex justify-center w-full">
                      {getBadgeIcon(badge.id, !!badge.earned)}
                      {badge.earned && (
                        <UIBadge color="success" className="absolute -bottom-1 -right-0 px-1 py-0 h-6 w-6 flex items-center justify-center rounded-full shadow-md bg-green-500 text-white border-2 border-white dark:border-slate-800">
                          ✓
                        </UIBadge>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <h4 className="text-xs font-medium">{badge.name}</h4>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    {badge.earned && badge.earnedAt && (
                      <p className="text-xs text-blue-500">
                        Earned on {formatDate(badge.earnedAt)}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeGrid;
