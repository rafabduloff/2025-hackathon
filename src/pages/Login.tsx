import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyUser } from '../database/db';
import AchievementService from '../services/achievements';
import '../styles/AuthForm.css';

// --- SVG иконки ---
const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await verifyUser(username, password);
      if (user) {
        localStorage.setItem('userId', user.id.toString());
        console.log('User logged in, userId:', user.id);

        try {
          const achievementService = AchievementService.getInstance();
          await achievementService.updateAchievementProgress(user.id, 'first-login', 1);
          console.log('Checked first-login achievement');
        } catch (achieveError) {
          console.error("Error updating first-login achievement:", achieveError);
        }

        navigate('/quiz');
      } else {
        setError('Неверное имя пользователя или пароль');
      }
    } catch (error) {
      setError('Произошла ошибка при входе');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 id="auth-title">Вход</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {/* Используем SVG иконки */}
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </span>
          </div>
          <div className="login-options">
            <div className="remember-me">
              {/* Связываем label и input через id */}
              <input
                 type="checkbox"
                 id="remember-me-checkbox"
                 checked={rememberMe}
                 onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me-checkbox">
                Запомнить меня
              </label>
            </div>
            <div className="forgot-password">
              <Link to="/forgot-password">Забыли пароль?</Link>
            </div>
          </div>
          <button type="submit" className="auth-button">
            Войти
          </button>
        </form>
        <p className="switch-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 