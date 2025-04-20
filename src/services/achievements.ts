import { Achievement, AchievementProgress, UserAchievements } from '../types/achievements';
import AchievementsDb from '../database/achievementsDb';
import { UserAchievementRow } from '../database/achievementsDb';

class AchievementService {
  private static instance: AchievementService;
  private db: AchievementsDb;

  private constructor() {
    this.db = AchievementsDb.getInstance();
  }

  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  public async getUserAchievements(userId: number): Promise<UserAchievements> {
    return this.db.getUserAchievements(userId);
  }

  public async updateAchievementProgress(
    userId: number,
    achievementId: string,
    progressOrIncrementValue: number,
    options: { increment?: boolean } = {}
  ): Promise<UserAchievementRow | null> {
    return this.db.updateAchievementProgress(userId, achievementId, progressOrIncrementValue, options);
  }

  public async checkAndUpdateAchievements(
    userId: number,
    category: string,
    action: string,
    value: number
  ): Promise<void> {
    const achievements = await this.db.getAchievements();
    const relevantAchievements = achievements.filter(
      a => a.category === category && a.id.includes(action)
    );

    for (const achievement of relevantAchievements) {
      await this.updateAchievementProgress(userId, achievement.id, value);
    }
  }

  public async initializeAchievements(): Promise<void> {
    await this.db.initializeAchievements();
  }
}

export default AchievementService; 