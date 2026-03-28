import { useState, useEffect, useCallback } from "react";
import { levels } from "@/data/gamificationLevels";
import { availableBadges } from "@/data/availableBadges";
import { checkAndAwardBadges } from "@/utils/badgeUtils";
import { useTasks } from "@/hooks/useTasks";
import api from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export const useGamificationState = (profile) => {
  const { tasks } = useTasks();
  const { refreshProfile } = useAuth(); // Import from AuthContext to refresh profile data
  
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);

  // Fetch badges from API
  const fetchBadges = useCallback(async () => {
    if (!profile) return;
    try {
      const earnedBadgesData = await api.get('/api/gamification/badges');
      
      // Merge with availableBadges
      const mergedBadges = availableBadges.map(availableBadge => {
        const earned = earnedBadgesData.find(b => b.id === availableBadge.id);
        if (earned) {
          return { ...availableBadge, earned: true, earnedAt: new Date(earned.earnedAt) };
        }
        return { ...availableBadge, earned: false };
      });
      
      setBadges(mergedBadges);
    } catch (err) {
      console.error("Failed to fetch badges", err);
    }
  }, [profile]);

  // Initialize data from user profile
  useEffect(() => {
    if (profile) {
      setPoints(profile.points || 0);
      setStreak(profile.streak || 0);
      
      // Initialize badges from backend
      fetchBadges();

      // Set mock leaderboard position
      setLeaderboardPosition(Math.floor(Math.random() * 100) + 1);
    } else {
      setPoints(0);
      setStreak(0);
      setBadges([]);
    }
  }, [profile, fetchBadges]);

  // Listen for streak updates from TaskContext
  useEffect(() => {
    const handleStreakUpdate = (event) => {
      setStreak(event.detail);
      console.log('Streak updated in GamificationContext:', event.detail);
      refreshProfile(); // Trigger profile sync with backend
    };

    window.addEventListener('streak-updated', handleStreakUpdate);
    
    return () => {
      window.removeEventListener('streak-updated', handleStreakUpdate);
    };
  }, [refreshProfile]);

  // Update badges based on tasks and streak
  useEffect(() => {
    if (!profile || badges.length === 0) return;
    
    const updatedBadges = checkAndAwardBadges(badges, tasks, streak);
    
    // Find newly earned badges
    const newBadges = updatedBadges.filter((ub, index) => ub.earned && !badges[index].earned);
    
    if (newBadges.length > 0) {
      setBadges(updatedBadges);
      
      // Push each new badge to the backend
      newBadges.forEach(badge => {
        api.post('/api/gamification/badges', {
          id: badge.id,
          name: badge.name,
          description: badge.description
        }).catch(err => console.error("Error saving badge", err));
      });
    }
  }, [tasks, streak, profile]); // Intentionally omitting badges to prevent infinite loop on award

  // Earn points function
  const earnPoints = async (amount) => {
    if (!profile) return;
    
    const newPoints = points + amount;
    setPoints(newPoints);
    
    try {
      await api.put('/api/profiles/me', { points: newPoints });
      refreshProfile();
    } catch (err) {
      console.error("Failed to update points", err);
    }
  };

  // Update streak function
  const updateStreak = async (completed) => {
    if (!profile) return;
    
    let newStreak = streak;
    if (completed) {
      newStreak += 1;
    } else {
      newStreak = 0; // Reset streak on missed day
    }
    
    setStreak(newStreak);
    
    try {
      await api.put('/api/profiles/me', { streak: newStreak });
      refreshProfile();
    } catch (err) {
      console.error("Failed to update streak", err);
    }
  };

  // Determine current level based on points
  const getCurrentLevel = () => {
    for (const level of levels) {
      if (points >= level.minPoints && points <= level.maxPoints) {
        return level;
      }
    }
    return levels[0]; // Default to first level
  };

  return {
    points,
    streak,
    badges,
    level: getCurrentLevel(),
    earnPoints,
    updateStreak,
    leaderboardPosition,
    setBadges
  };
};
