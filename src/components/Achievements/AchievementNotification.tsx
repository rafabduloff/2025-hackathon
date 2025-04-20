import React, { useEffect, useState } from 'react';
import { Achievement } from '../../types/achievements';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div className="notification-content">
        <div className="achievement-icon">
          <img src={achievement.icon} alt={achievement.title} />
        </div>
        <div className="achievement-info">
          <h3>Новое достижение!</h3>
          <h4>{achievement.title}</h4>
          <p>{achievement.description}</p>
          <div className="achievement-points">
            +{achievement.points} очков
          </div>
        </div>
        <button className="close-button" onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}>
          ×
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification; 
