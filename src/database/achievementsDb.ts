import { Achievement, AchievementProgress, UserAchievements, AchievementCategory } from '../types/achievements';

interface AchievementRow {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  is_secret: number;
  max_progress: number;
  type: string;
}

export interface UserAchievementRow extends AchievementRow {
  progress: number;
  is_unlocked: number;
  unlock_date: string | null;
}

class AchievementsDb {
  private static instance: AchievementsDb;
  private achievements: Achievement[] = [];
  private userAchievements: Map<number, Map<string, UserAchievementRow>> = new Map();

  private constructor() {
    this.initializeAchievements();
  }

  public static getInstance(): AchievementsDb {
    if (!AchievementsDb.instance) {
      AchievementsDb.instance = new AchievementsDb();
    }
    return AchievementsDb.instance;
  }

  private saveToLocalStorage(): void {
    console.log("[AchievementsDb] Attempting to save data to localStorage...");
    localStorage.setItem('achievements', JSON.stringify(this.achievements));
    console.log("[AchievementsDb] Saved achievement definitions.");

    const serializableUserAchievements = [...this.userAchievements].map(([userId, innerMap]) => {
        if (innerMap instanceof Map) {
            return [userId, [...innerMap]];
        } else {
            console.error(`[AchievementsDb] Invalid inner map found for userId ${userId} during serialization. Saving empty progress for user.`);
            return [userId, []];
        }
    });
    
    try {
        localStorage.setItem('userAchievements', JSON.stringify(serializableUserAchievements));
        console.log("[AchievementsDb] Saved userAchievements progress (with inner maps as arrays).");
    } catch (error) {
         console.error("[AchievementsDb] Error saving userAchievements to localStorage:", error);
    }
  }

  public async getAchievements(): Promise<Achievement[]> {
    return this.achievements.map(achievement => ({
      ...achievement,
      progress: 0,
      isUnlocked: false
    }));
  }

  public async getUserAchievements(userId: number): Promise<UserAchievements> {
    console.log(`[AchievementsDb] getUserAchievements called for userId: ${userId}`); 
    
    if (!(this.userAchievements instanceof Map)) {
        console.error("[AchievementsDb] FATAL: this.userAchievements is not a Map! Re-initializing.", this.userAchievements);
        this.userAchievements = new Map<number, Map<string, UserAchievementRow>>();
        this.userAchievements.set(userId, new Map<string, UserAchievementRow>());
    }

    let userAchievementsMap = this.userAchievements.get(userId);

    if (!userAchievementsMap) {
        console.log(`[AchievementsDb] No progress found for userId: ${userId}. Creating new map.`);
        userAchievementsMap = new Map<string, UserAchievementRow>();
        this.userAchievements.set(userId, userAchievementsMap);
    } else if (!(userAchievementsMap instanceof Map)) {
        console.error(`[AchievementsDb] FATAL: userAchievementsMap for userId ${userId} is not a Map! Resetting progress. Data:`, userAchievementsMap);
        userAchievementsMap = new Map<string, UserAchievementRow>();
        this.userAchievements.set(userId, userAchievementsMap);
    }
    
    console.log(`[AchievementsDb] Found user map for userId ${userId}:`, userAchievementsMap);

    const achievements = this.achievements.map(achievement => {
      const userAchievement = userAchievementsMap.get(achievement.id);
      if (achievement.id === 'quiz-perfect-score') {
          console.log(`[AchievementsDb] Processing 'quiz-perfect-score': `, userAchievement);
      }
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.is_unlocked === 1,
        unlockDate: userAchievement?.unlock_date ? new Date(userAchievement.unlock_date) : undefined
      };
    });

    const totalPoints = achievements.reduce((sum, a) => sum + (a.isUnlocked ? a.points : 0), 0);
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;

    return {
      userId,
      achievements,
      totalPoints,
      unlockedCount,
      totalCount: achievements.length
    };
  }

  public async updateAchievementProgress(
    userId: number,
    achievementId: string,
    progressOrIncrementValue: number, 
    options: { increment?: boolean } = {}
  ): Promise<UserAchievementRow | null> {
    console.log(`[AchievementsDb] updateAchievementProgress called for userId: ${userId}, achievementId: ${achievementId}, value: ${progressOrIncrementValue}, options:`, options);
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) {
        console.warn(`[AchievementsDb] Achievement with id ${achievementId} not found in definitions.`);
        return null;
    }

    let userAchievementsMap = this.userAchievements.get(userId);
    if (!userAchievementsMap) {
      userAchievementsMap = new Map();
      this.userAchievements.set(userId, userAchievementsMap);
    }

    const currentUserAchievement = userAchievementsMap.get(achievementId);
    let newProgress = 0;

    if (options.increment) {
        newProgress = (currentUserAchievement?.progress || 0) + progressOrIncrementValue;
    } else {
        newProgress = progressOrIncrementValue;
    }
    
    newProgress = Math.min(newProgress, achievement.maxProgress);

    const wasAlreadyUnlocked = currentUserAchievement?.is_unlocked === 1;
    const isNowUnlocked = newProgress >= achievement.maxProgress;
    const unlockDate = isNowUnlocked && !wasAlreadyUnlocked 
                        ? new Date().toISOString() 
                        : (currentUserAchievement?.unlock_date || null);

    console.log(`[AchievementsDb] Updating ${achievementId}: New Progress=${newProgress}, Is Now Unlocked=${isNowUnlocked}, Unlock Date=${unlockDate}, Was Already Unlocked=${wasAlreadyUnlocked}`);

    const achievementDataToSave: UserAchievementRow = {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      icon: achievement.icon,
      points: achievement.points,
      is_secret: achievement.isSecret ? 1 : 0,
      max_progress: achievement.maxProgress,
      type: 'default',
      progress: newProgress, 
      is_unlocked: isNowUnlocked ? 1 : 0,
      unlock_date: unlockDate
    };
    
    userAchievementsMap.set(achievementId, achievementDataToSave);
    console.log(`[AchievementsDb] Set data in map for ${achievementId}:`, achievementDataToSave);

    this.saveToLocalStorage();
    console.log(`[AchievementsDb] Saved userAchievements map to localStorage for user ${userId}`);
    
    if (isNowUnlocked && !wasAlreadyUnlocked) {
        console.log(`[AchievementsDb] Achievement ${achievementId} UNLOCKED! Returning data.`);
        return achievementDataToSave;
    }
    
    return null;
  }

  private initializeAchievements(): void {
    console.log('Initializing achievement definitions and user progress...');

    this.achievements = [
      // --- Quiz Achievements ---
      {
        id: 'quiz-beginner', title: 'Новичок в квизе', description: 'Пройдите квиз на легком уровне сложности.',
        category: 'quiz', icon: '/icons/achievements/quiz-beginner.png', points: 10, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      {
        id: 'quiz-advanced', title: 'Знаток Marvel', description: 'Пройдите квиз на среднем уровне сложности.',
        category: 'quiz', icon: '/icons/achievements/quiz-advanced.png', points: 25, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
       {
        id: 'quiz-expert', title: 'Эксперт Вселенной', description: 'Пройдите квиз на сложном уровне сложности.',
        category: 'quiz', icon: '/icons/achievements/quiz-expert.png', points: 50, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      {
        id: 'quiz-perfect-score', title: 'Идеальный результат', description: 'Пройдите любой квиз без единой ошибки.',
        category: 'quiz', icon: '/icons/achievements/quiz-perfect.png', points: 75, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      {
        id: 'quiz-no-hints', title: 'Своим умом', description: 'Пройдите сложный квиз, не используя подсказки.',
        category: 'quiz', icon: '/icons/achievements/quiz-no-hints.png', points: 100, isSecret: true,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      // --- Minigame Achievements ---
      {
        id: 'minigame-first-win', title: 'Первая победа', description: 'Выиграйте одну мини-игру "Угадай героя".',
        category: 'minigame', icon: '/icons/achievements/minigame-first-win.png', points: 10, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      {
        id: 'minigame-score-100', title: 'Сотня очков', description: 'Наберите 100 очков в мини-игре.',
        category: 'minigame', icon: '/icons/achievements/minigame-score-100.png', points: 25, isSecret: false,
        maxProgress: 100, progress: 0, isUnlocked: false
      },
      {
        id: 'minigame-score-500', title: 'Пятьсот очков', description: 'Наберите 500 очков в мини-игре.',
        category: 'minigame', icon: '/icons/achievements/minigame-score-500.png', points: 50, isSecret: false,
        maxProgress: 500, progress: 0, isUnlocked: false
      },
      {
        id: 'minigame-streak-5', title: 'Серия побед', description: 'Выиграйте 5 мини-игр подряд.',
        category: 'minigame', icon: '/icons/achievements/minigame-streak.png', points: 75, isSecret: false,
        maxProgress: 5, progress: 0, isUnlocked: false
      },
      // --- Exploration Achievements ---
       {
        id: 'explore-history', title: 'Летописец', description: 'Просмотрите всю Историю Киновселенной.',
        category: 'exploration', icon: '/icons/achievements/explore-history.png', points: 50, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
       {
        id: 'explore-character', title: 'Первое знакомство', description: 'Откройте страницу любого персонажа.',
        category: 'exploration', icon: '/icons/achievements/explore-character.png', points: 10, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
       {
        id: 'explore-all-characters', title: 'Знаток Героев', description: 'Откройте страницы всех доступных персонажей.',
        category: 'exploration', icon: '/icons/achievements/explore-all.png', points: 100, isSecret: false,
        maxProgress: 9, progress: 0, isUnlocked: false
      },
       // --- Profile Achievements ---
        {
        id: 'profile-register', title: 'Добро пожаловать!', description: 'Успешно зарегистрируйтесь в системе.',
        category: 'profile', icon: '/icons/achievements/profile-register.png', points: 5, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
       {
        id: 'profile-login-streak-3', title: 'Постоянный посетитель', description: 'Заходите в профиль 3 дня подряд.',
        category: 'profile', icon: '/icons/achievements/profile-login-streak.png', points: 30, isSecret: false,
        maxProgress: 3, progress: 0, isUnlocked: false
      },
       {
        id: 'profile-complete', title: 'Заполненный профиль', description: 'Заполните все поля в профиле (если они есть).',
        category: 'profile', icon: '/icons/achievements/profile-complete.png', points: 20, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      // --- Secret Achievement Example ---
       {
        id: 'secret-konami', title: '???', description: 'Что-то секретное...',
        category: 'other', icon: '/icons/achievements/secret.png', points: 100, isSecret: true,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      // --- Добавленные Достижения ---
      {
        id: 'history-voyager', title: 'Путешественник во времени', description: 'Прочитать всю хронологию Саги Бесконечности.',
        category: 'exploration', icon: '/icons/achievements/default.png', points: 30, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      {
        id: 'character-catalog-viewer', title: 'Знаток каталога', description: 'Просмотреть страницы 5 разных персонажей.',
        category: 'exploration', icon: '/icons/achievements/default.png', points: 25, isSecret: false,
        maxProgress: 5, progress: 0, isUnlocked: false
      },
      {
        id: 'first-login', title: 'Добро пожаловать!', description: 'Впервые войти в систему.',
        category: 'general', icon: '/icons/achievements/default.png', points: 5, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
      {
        id: 'quiz-veteran', title: 'Ветеран квизов', description: 'Пройти квиз (любой сложности) 5 раз.',
        category: 'quiz', icon: '/icons/achievements/default.png', points: 40, isSecret: false,
        maxProgress: 5, progress: 0, isUnlocked: false
      },
      {
        id: 'about-page-visitor', title: 'Любопытный', description: 'Посетить страницу "О проекте".',
        category: 'exploration', icon: '/icons/achievements/default.png', points: 10, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
       {
        id: 'minigame-master', title: 'Мастер мини-игры', description: 'Набрать максимальный балл в мини-игре "Угадай героя".',
        category: 'minigame', icon: '/icons/achievements/default.png', points: 60, isSecret: false,
        maxProgress: 1, progress: 0, isUnlocked: false
      },
    ];
    console.log(`[AchievementsDb] Initialized ${this.achievements.length} achievement definitions.`); 

    localStorage.setItem('achievements', JSON.stringify(this.achievements)); 
    console.log('[AchievementsDb] Saved current achievement definitions to localStorage.'); 
    
    const storedUserAchievements = localStorage.getItem('userAchievements');
    const reconstructedOuterMap = new Map<number, Map<string, UserAchievementRow>>();

    if (storedUserAchievements) {
        console.log('[AchievementsDb] Found user achievements progress in localStorage. Attempting to parse and reconstruct...');
        try {
            const parsedOuterArray = JSON.parse(storedUserAchievements);
            
            if (Array.isArray(parsedOuterArray)) {
                parsedOuterArray.forEach(([userId, innerArray]) => {
                    if (typeof userId === 'number' && Array.isArray(innerArray)) {
                        try {
                           const reconstructedInnerMap = new Map<string, UserAchievementRow>(innerArray.filter(item => Array.isArray(item) && item.length === 2));
                           reconstructedOuterMap.set(userId, reconstructedInnerMap);
                        } catch (innerMapError) {
                            console.error(`[AchievementsDb] Error reconstructing inner map for userId ${userId}. Skipping entry.`, innerMapError, innerArray);
                        }
                    } else {
                         console.warn(`[AchievementsDb] Invalid data structure found during reconstruction for userId ${userId}. Skipping entry.`, innerArray);
                    }
                });
                this.userAchievements = reconstructedOuterMap; 
                console.log('[AchievementsDb] User achievements progress maps successfully reconstructed.');
            } else {
                 console.warn('[AchievementsDb] Parsed user achievements progress is not an array. Starting with empty progress.');
                 this.userAchievements = reconstructedOuterMap; 
            }
        } catch(e) {
             console.error("[AchievementsDb] Failed to parse or reconstruct userAchievements from localStorage. Starting with empty progress.", e);
             this.userAchievements = reconstructedOuterMap; 
        }
    } else {
         this.userAchievements = reconstructedOuterMap; 
         console.log('[AchievementsDb] No user achievements progress found in localStorage. Starting with empty map.');
    }
  }
}

export default AchievementsDb; 