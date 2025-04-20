export type AchievementCategory = 'quiz' | 'minigame' | 'profile' | 'social' | 'exploration' | 'general' | 'other';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  points: number;
  isSecret: boolean;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockDate?: Date;
}

export interface AchievementProgress {
  userId: number;
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockDate?: Date;
}

export interface UserAchievements {
  userId: number;
  achievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
} 