import React, { useEffect } from 'react';
import AchievementService from '../services/achievements';
import '../styles/About.css';

const About: React.FC = () => {

  useEffect(() => {
    const checkAchievement = async () => {
      const userIdString = localStorage.getItem('userId');
      if (userIdString) {
        try {
          const userId = parseInt(userIdString);
          const achievementService = AchievementService.getInstance();
          await achievementService.updateAchievementProgress(userId, 'about-page-visitor', 1);
          console.log('Checked about-page-visitor achievement');
        } catch (err) {
          console.error("Error updating about-page-visitor achievement:", err);
        }
      }
    };
    checkAchievement();
  }, []);

  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">О проекте Marvel Universe</h1>
        
        <section className="about-section">
          <h2 className="section-title">Цель проекта</h2>
          <p className="section-text">
            Marvel Universe - это интерактивный фан-проект, созданный для поклонников вселенной Marvel.
            Наш проект объединяет в себе несколько увлекательных активностей, которые помогут вам
            проверить свои знания о любимой вселенной и весело провести время.
          </p>
        </section>

        <section className="about-section">
          <h2 className="section-title">Основные функции</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">Интерактивный лендинг</h3>
              <p className="feature-text">
                Главная страница с динамической 3D-сценой, описанием возможностей 
                и быстрыми ссылками на разделы.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">Каталог персонажей</h3>
              <p className="feature-text">
                Список ключевых героев Marvel с возможностью 
                просмотра детальной информации и 3D-моделей.
              </p>
            </div>
            
            <div className="feature-card">
              <h3 className="feature-title">История Киновселенной</h3>
              <p className="feature-text">
                Интерактивная хронология ключевых событий 
                Саги Бесконечности с описаниями и изображениями.
              </p>
            </div>
            
            <div className="feature-card">
              <h3 className="feature-title">Квиз</h3>
              <p className="feature-text">
                Проверь свои знания о вселенной Marvel. Несколько уровней сложности
                и система подсказок для самых любознательных.
              </p>
            </div>
            
            <div className="feature-card">
              <h3 className="feature-title">Мини-игра "Угадай героя"</h3>
              <p className="feature-text">
                Угадывай персонажей по их известным цитатам. 
                Собирай очки и получай достижения!
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">Профиль пользователя</h3>
              <p className="feature-text">
                Регистрация и авторизация для сохранения прогресса в квизе, 
                статистики в мини-игре и коллекции достижений.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section tech-section">
          <h2 className="section-title">Используемые технологии</h2>
          {/* Можно заменить на более визуальный список */}
          <ul className="tech-list">
            <li><strong>Frontend:</strong> React, TypeScript, Vite</li>
            <li><strong>Стилизация:</strong> CSS Modules / Styled Components (уточнить), CSS анимации</li>
            <li><strong>3D Графика:</strong> Three.js, React Three Fiber, Drei</li>
            <li><strong>Хранение данных:</strong> LocalStorage, IndexedDB (для достижений?)</li>
            <li><strong>Маршрутизация:</strong> React Router DOM</li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="section-title">Технические особенности</h2>
          <ul className="tech-list">
            <li>React + TypeScript для создания интерактивного интерфейса</li>
            <li>LocalStorage для хранения данных пользователей и результатов</li>
            <li>Адаптивный дизайн для всех устройств</li>
            <li>Современные CSS-анимации и эффекты</li>
            <li><strong>Визуальный стиль:</strong> Мягкие градиенты и свечение (glow) с визуальными эффектами</li>
            <li>Система аутентификации с шифрованием данных</li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="section-title">Разработка</h2>
          <p className="section-text">
            Этот сайт посвящен вселенной Marvel, предоставляя фанатам интерактивные возможности для проверки знаний и изучения истории любимых персонажей.
          </p>
          <p className="section-text">
            Проект разрабатывается как хакатон, с фокусом на создание качественного пользовательского опыта и интересного контента для фанатов Marvel.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About; 