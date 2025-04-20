import React, { useEffect, useState } from 'react';
import { Achievement } from '../../types/achievements';
import './AchievementUnlockAnimation.css';

interface AchievementUnlockAnimationProps {
  achievement: Achievement;
  onComplete: () => void;
}

const AchievementUnlockAnimation: React.FC<AchievementUnlockAnimationProps> = ({ 
  achievement, 
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 2000);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    
    const confettiArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setConfetti(confettiArray);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`achievement-unlock-animation ${isVisible ? 'visible' : ''}`}>
      <div className="animation-content">
        <div className="confetti-container">
          {confetti.map(confetti => (
            <div
              key={confetti.id}
              className="confetti"
              style={{
                left: `${confetti.left}%`,
                animationDelay: `${confetti.delay}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
        <div className="achievement-icon">
          <img src={achievement.icon} alt={achievement.title} />
        </div>
        <div className="achievement-info">
          <h3>Достижение разблокировано!</h3>
          <h4>{achievement.title}</h4>
          <p>{achievement.description}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="achievement-points">
            +{achievement.points} очков
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementUnlockAnimation; 
