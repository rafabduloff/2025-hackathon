import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResetPassword.css';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      setMessage('Инструкции по сбросу пароля отправлены на вашу почту');
      setStep(2);
    } catch (err) {
      setError('Произошла ошибка при запросе сброса пароля');
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      setStep(3);
    } catch (err) {
      setError('Неверный токен');
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      setMessage('Пароль успешно изменен');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Произошла ошибка при изменении пароля');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Сброс пароля</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit">Запросить сброс пароля</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyToken}>
            <div className="form-group">
              <label htmlFor="token">Введите код из письма</label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <button type="submit">Проверить код</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSetNewPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">Новый пароль</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Установить новый пароль</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 
