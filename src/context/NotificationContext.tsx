import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Achievement } from '../types/achievements';
import { UserAchievementRow } from '../database/achievementsDb'; // Используем экспортированный тип

// Определяем тип для данных уведомления (может быть немного другим, чем UserAchievementRow)
// Используем базовый Achievement, так как компонент уведомления его ожидает
export type NotificationData = Achievement;

interface NotificationContextType {
  notification: NotificationData | null;
  showNotification: (achievementData: UserAchievementRow) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  
  const showNotification = (achievementData: UserAchievementRow) => {
    // Преобразуем UserAchievementRow в Achievement для компонента уведомления
    const notificationData: NotificationData = {
        ...achievementData, // Копируем основные поля
        isSecret: achievementData.is_secret === 1,
        isUnlocked: achievementData.is_unlocked === 1,
        unlockDate: achievementData.unlock_date ? new Date(achievementData.unlock_date) : undefined,
        // progress и maxProgress уже есть в UserAchievementRow
    };
    setNotification(notificationData);
    // Автоматическое скрытие будет обрабатываться в компоненте Layout или в самом Notification
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 