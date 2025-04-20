import React from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../data/characters'; // Используем тот же интерфейс
// Стили будут общими из Characters.css, но можно добавить специфичные, если нужно

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <Link to={`/characters/${character.id}`} className="character-card">
      <img 
        src={character.thumbnail} 
        alt={character.name} 
        className="character-card-image" 
        loading="lazy"
        onError={(e) => {
            // Устанавливаем серый фон и убираем alt текст, если картинка не загрузилась
            const target = e.currentTarget;
            target.style.backgroundColor = '#cccccc'; // Серый фон
            target.style.objectFit = 'contain'; // Чтобы не растягивать заглушку, если она есть
            target.alt = 'Изображение не найдено'; // Поясняющий текст
            // Можно также установить src на заглушку, если она есть
            // target.src = '/images/placeholder.png'; 
        }}
       />
      {/* Возвращаем имя персонажа */}
      <h3 className="character-card-name">{character.name}</h3>
      {/* Можно добавить краткое описание или год первого появления */}
      {/* <p className="character-card-appearance">{character.firstAppearance}</p> */}
    </Link>
  );
};

export default CharacterCard; 