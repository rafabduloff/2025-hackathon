import React, { useState, useEffect } from 'react';
import { Achievement, AchievementCategory, UserAchievements } from '../types/achievements';
import AchievementCard from '../components/Achievements/AchievementCard';
import AchievementService from '../services/achievements';
import './Achievements.css';

const Achievements: React.FC = () => {
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = userAchievements
    ? ['all', ...new Set(userAchievements.achievements.map(a => a.category))]
    : ['all'];

  useEffect(() => {
    const fetchAchievements = async () => {
      setIsLoading(true);
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError("Пользователь не авторизован.");
        setIsLoading(false);
        return;
      }

      try {
        const numericUserId = parseInt(userId);
        const achievementService = AchievementService.getInstance();
        const data = await achievementService.getUserAchievements(numericUserId);
        setUserAchievements(data);
      } catch (err) {
        console.error("Ошибка загрузки достижений:", err);
        setError("Не удалось загрузить достижения.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const filteredAchievements = userAchievements?.achievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  ).sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
          return a.isUnlocked ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
  });

  const getCategoryName = (category: AchievementCategory | 'all'): string => {
    switch (category) {
      case 'quiz': return 'Квизы';
      case 'minigame': return 'Мини-игры';
      case 'profile': return 'Профиль';
      case 'exploration': return 'Исследование';
      case 'other': return 'Другое';
      case 'social': return 'Социальные';
      case 'all': return 'Все';
      default: return category;
    }
  };

  if (isLoading) {
    return <div className="achievements-loading">Загрузка достижений...</div>;
  }

  if (error) {
      return <div className="achievements-error">Ошибка: {error}</div>;
  }

  if (!userAchievements) {
      return <div className="achievements-error">Не удалось загрузить данные.</div>;
  }

  return (
    <div className="achievements-page">
      <h1>Достижения</h1>
      
      <div className="achievements-summary">
        <div className="summary-item">
          <span className="summary-label">Разблокировано</span>
          <span className="summary-value">{userAchievements?.unlockedCount} / {userAchievements?.totalCount}</span>
        </div>
        <div className="summary-item">
           <span className="summary-label">Очков</span>
           <span className="summary-value points-value">{userAchievements?.totalPoints}</span>
        </div>
      </div>

      <div className="category-filters">
         {availableCategories.map(category => (
            <button 
                key={category}
                className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category as AchievementCategory | 'all')}
            >
                {getCategoryName(category as AchievementCategory | 'all')}
            </button>
         ))}
      </div>

      <div className="achievements-grid">
        {filteredAchievements && filteredAchievements.length > 0 ? (
          filteredAchievements.map(achievement => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement}
            />
          ))
        ) : (
          <p className="no-achievements">Нет достижений в этой категории.</p>
        )}
      </div>
    </div>
  );
};

export default Achievements; 