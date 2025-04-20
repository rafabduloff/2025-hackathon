import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarvelScene from '../components/ThreeScene/MarvelScene';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  return (
    <div className="home-container">
      <div className="content-overlay">
        <div className="header-content">
          <h1 className="title">Вселенная Marvel</h1>
          <p className="subtitle">Исследуй мир Marvel: узнай больше о любимых героях, проверь свои знания в квизе, погрузись в историю киновселенной и собери коллекцию достижений.</p>
        </div>
        
        <MarvelScene />
        
        <div className="features-section">
          <div 
            className={`feature ${isHovered === 'quiz' ? 'active' : ''}`}
            onMouseEnter={() => setIsHovered('quiz')}
            onMouseLeave={() => setIsHovered(null)}
            onClick={() => navigate('/quiz')}
          >
            <h3>Интерактивный квиз</h3>
            <p>Проверь свои знания о персонажах, фильмах и событиях киновселенной.</p>
          </div>
          
          <div 
            className={`feature ${isHovered === 'minigame' ? 'active' : ''}`}
            onMouseEnter={() => setIsHovered('minigame')}
            onMouseLeave={() => setIsHovered(null)}
            onClick={() => navigate('/minigame')}
          >
            <h3>Мини-игра</h3>
            <p>Угадывай персонажей по цитатам и собирай уникальные достижения.</p>
          </div>
          
          <div 
            className={`feature ${isHovered === 'history' ? 'active' : ''}`}
            onMouseEnter={() => setIsHovered('history')}
            onMouseLeave={() => setIsHovered(null)}
            onClick={() => navigate('/marvel-history')}
          >
            <h3>История Киновселенной</h3>
            <p>Проследи ключевые события саги Бесконечности в хронологическом порядке.</p>
          </div>
          
          <div 
            className={`feature ${isHovered === 'characters' ? 'active' : ''}`}
            onMouseEnter={() => setIsHovered('characters')}
            onMouseLeave={() => setIsHovered(null)}
            onClick={() => navigate('/characters')}
          >
            <h3>Герои Marvel</h3>
            <p>Исследуй детальную информацию и 3D модели супергероев.</p>
          </div>
        </div>
        
        <div className="buttons-container">
          <button 
            className="action-button quiz-button"
            onClick={() => navigate('/quiz')}
            onMouseEnter={() => setIsHovered('quiz')}
            onMouseLeave={() => setIsHovered(null)}
          >
            Начать Квиз
          </button>
          <button 
            className="action-button minigame-button"
            onClick={() => navigate('/minigame')}
            onMouseEnter={() => setIsHovered('minigame')}
            onMouseLeave={() => setIsHovered(null)}
          >
            Мини-Игра
          </button>
          <button 
            className="action-button history-button"
            onClick={() => navigate('/marvel-history')}
            onMouseEnter={() => setIsHovered('history')}
            onMouseLeave={() => setIsHovered(null)}
          >
            Лента Истории
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 