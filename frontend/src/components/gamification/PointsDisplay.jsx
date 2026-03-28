
import * as React from "react";
import { useEffect, useState } from "react";
import { useGamification } from "@/contexts/GamificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Trophy, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PointsDisplay = () => {
  const { points, level, streak } = useGamification();
  const { profile } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(streak);
  

  useEffect(() => {
    if (profile) {
      setCurrentStreak(profile.streak);
    }
  }, [profile]);
  
  // Listen for streak updates
  useEffect(() => {
    setCurrentStreak(streak);
  }, [streak]);
  
  // Calculate progress to next level
  const progress = Math.min(
    ((points - level.minPoints) / (level.maxPoints - level.minPoints)) * 100,
    100
  );
  
  return (
    <Card className="bg-white dark:bg-tap-dark-charcoal">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{points}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="w-20 h-20">
              <CircularProgressbar
                value={progress}
                text={`${level.level}`}
                styles={buildStyles({
                  textSize: '32px',
                  pathColor: `rgba(62, 152, 199, ${progress / 100})`,
                  textColor: '#3e98c7',
                  trailColor: '#d6d6d6',
                })}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center items-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="text-3xl font-bold text-yellow-500">{currentStreak}</span>
            </div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            <Star className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{level.title}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {level.maxPoints < Infinity ? 
              `${points} / ${level.maxPoints} points to next level` :
              `${points} points - Max level reached!`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;
