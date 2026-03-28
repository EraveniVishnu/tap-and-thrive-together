export const checkAndAwardBadges = (
  badges, 
  tasks, 
  streak
) => {
  // First task badge
  const completedTasks = tasks.filter(task => task.status === "Completed");
  let updatedBadges = [...badges];
  
  if (completedTasks.length > 0) {
    updatedBadges = awardBadgeIfNotEarned(updatedBadges, "first_task");
  }

  // Streak badges
  if (streak >= 3) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_3");
  if (streak >= 7) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_7");
  if (streak >= 14) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_14");
  if (streak >= 21) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_21");
  if (streak >= 30) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_30");
  if (streak >= 60) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_60");
  if (streak >= 90) updatedBadges = awardBadgeIfNotEarned(updatedBadges, "streak_90");

  // Suggested tasks master
  const completedSuggestedTasks = tasks.filter(
    task => task.type === "Suggested" && task.status === "Completed"
  );
  if (completedSuggestedTasks.length >= 20) {
    updatedBadges = awardBadgeIfNotEarned(updatedBadges, "suggested_master");
  }

  return updatedBadges;
};

export const awardBadgeIfNotEarned = (badges, badgeId) => {
  return badges.map(badge => 
    badge.id === badgeId && !badge.earned
      ? { ...badge, earned: true, earnedAt: new Date() }
      : badge
  );
};
