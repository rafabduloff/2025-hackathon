import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../database/db';
import '../styles/Profile.css';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned_at: string;
}

interface GameResult {
  id: number;
  score: number;
  total_questions: number;
  date: string;
  difficulty?: string;
}

interface ProfileData {
  user: {
    username: string;
    email: string;
    created_at: string;
    last_login: string;
  };
  quizResults: GameResult[];
  minigameResults: GameResult[];
  achievements: Achievement[];
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        const profileData = await getUserProfile(parseInt(userId));
        setProfile(profileData);
      } catch (error) {
        setError('Ошибка загрузки профиля');
        console.error('Profile load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return <div className="profile-container">Загрузка...</div>;
  }

  if (error || !profile) {
    return <div className="profile-container">{error}</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Профиль пользователя</h2>
        <button onClick={() => navigate('/quiz')}>Вернуться к играм</button>
      </div>

      <div className="profile-section">
        <h3>Информация о пользователе</h3>
        <div className="user-info">
          <p><strong>Имя пользователя:</strong> {profile.user.username}</p>
          <p><strong>Email:</strong> {profile.user.email}</p>
          <p><strong>Дата регистрации:</strong> {formatDate(profile.user.created_at)}</p>
          <p><strong>Последний вход:</strong> {formatDate(profile.user.last_login)}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Достижения</h3>
        <div className="achievements-grid">
          {profile.achievements.map(achievement => (
            <div key={achievement.id} className="achievement-card">
              <span className="achievement-icon">{achievement.icon}</span>
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>
              <p className="achievement-date">Получено: {formatDate(achievement.earned_at)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3>Результаты квиза</h3>
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Сложность</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {profile.quizResults.map(result => (
                <tr key={result.id}>
                  <td>{formatDate(result.date)}</td>
                  <td>{result.difficulty}</td>
                  <td>{result.score} из {result.total_questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="profile-section">
        <h3>Результаты мини-игры</h3>
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {profile.minigameResults.map(result => (
                <tr key={result.id}>
                  <td>{formatDate(result.date)}</td>
                  <td>{result.score} из {result.total_questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
