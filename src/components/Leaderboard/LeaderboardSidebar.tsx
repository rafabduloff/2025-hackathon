import React from 'react';
import './LeaderboardSidebar.css';

// Определяем интерфейс для входных данных, соответствующих тому,
// что ожидает компонент через props
export interface LeaderboardSidebarEntry {
  rank: number;
  userId: number;
  nickname: string;
  avatar: string;
  score: number;
}

interface LeaderboardSidebarProps {
  title: string;
  data: LeaderboardSidebarEntry[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({ 
  title,
  data,
  isLoading,
  error,
  isOpen,
  onClose
}) => {
  return (
    <>
      <div className={`leaderboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        {isLoading && <div className="sidebar-loading">Загрузка...</div>}
        {error && <div className="sidebar-error">Ошибка: {error}</div>}
        
        {!isLoading && !error && (
          data.length > 0 ? (
            <ul className="leaderboard-list">
              {data.map((entry) => (
                <li key={entry.userId} className="leaderboard-item">
                  <span className="rank">{entry.rank}.</span>
                  <img src={entry.avatar} alt={entry.nickname} className="avatar" />
                  <span className="nickname">{entry.nickname}</span>
                  <span className="score">{entry.score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Нет данных для отображения.</p>
          )
        )}
      </div>
    </>
  );
};

export default LeaderboardSidebar; 