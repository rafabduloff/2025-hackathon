import React from 'react';
import { Achievement } from '../../types/achievements';
import './AchievementCard.css';

interface AchievementCardProps {
  achievement: Achievement;
  onUnlock?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : ''}`}>
      <div className="achievement-icon">
        <img 
          src={achievement.icon} 
          alt={achievement.title}
          className={achievement.isSecret && !achievement.isUnlocked ? 'secret' : ''}
        />
      </div>
      <div className="achievement-content">
        <h3>{achievement.title}</h3>
        <p>{achievement.description}</p>
        <div className="achievement-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="progress-text">
            {achievement.progress}/{achievement.maxProgress}
          </span>
        </div>
        {achievement.isUnlocked && achievement.unlockDate && (
          <p className="unlock-date">
            Разблокировано: {new Date(achievement.unlockDate).toLocaleDateString()}
          </p>
        )}
        <div className="achievement-points">
          {achievement.points} очков
        </div>
      </div>
    </div>
  );
};

export default AchievementCard; 
