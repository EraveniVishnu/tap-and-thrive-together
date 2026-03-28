
import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useGamificationState } from "@/hooks/useGamificationState";

const GamificationContext = createContext(undefined);

export const GamificationProvider = ({ children }) => {
  const { profile } = useAuth();
  const {
    points, 
    streak,
    badges,
    level,
    earnPoints,
    updateStreak,
    leaderboardPosition
  } = useGamificationState(profile);

  return (
    <GamificationContext.Provider
      value={{
        points,
        streak,
        badges,
        level,
        earnPoints,
        updateStreak,
        leaderboardPosition,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};
