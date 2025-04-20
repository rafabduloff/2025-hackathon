import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { charactersData, Character } from '../data/characters';
import AchievementService from '../services/achievements';
import '../styles/Characters.css'; // Используем тот же файл стилей

const CharacterDetailPage: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const foundCharacter = charactersData.find(char => char.id === characterId);
    setCharacter(foundCharacter || null);

    // ---> Добавляем проверку достижения 'character-catalog-viewer' <--- 
    const checkAchievement = async () => {
        const userIdString = localStorage.getItem('userId');
        if (userIdString && foundCharacter) {
            try {
                const userId = parseInt(userIdString);
                const storageKey = `visitedCharacters_${userId}`;
                
                // Получаем множество посещенных страниц из localStorage
                let visitedSet: Set<string>;
                try {
                    const storedValue = localStorage.getItem(storageKey);
                    visitedSet = storedValue ? new Set(JSON.parse(storedValue)) : new Set();
                } catch (parseError) {
                    console.error("Error parsing visited characters from localStorage:", parseError);
                    visitedSet = new Set(); // Начинаем заново при ошибке парсинга
                }
                
                // Добавляем текущего персонажа
                visitedSet.add(foundCharacter.id);
                
                // Сохраняем обновленное множество
                localStorage.setItem(storageKey, JSON.stringify(Array.from(visitedSet)));
                
                // Проверяем условие достижения (>= 5 уникальных)
                if (visitedSet.size >= 5) {
                    const achievementService = AchievementService.getInstance();
                    // Устанавливаем прогресс = 5 (или maxProgress)
                    await achievementService.updateAchievementProgress(userId, 'character-catalog-viewer', 5);
                    console.log('Checked character-catalog-viewer achievement (>= 5 visited)');
                } else {
                    // Можно опционально обновлять прогресс по количеству посещенных,
                    // но проще установить его один раз при достижении цели.
                    console.log(`Visited characters count for user ${userId}: ${visitedSet.size}`);
                }

            } catch (err) {
                console.error("Error updating character-catalog-viewer achievement:", err);
            }
        }
    };
    checkAchievement();
    // ---> Конец проверки достижения <--- 

  }, [characterId]);

  if (!character) {
    return (
        <div className="character-detail-container character-not-found">
            <h2>Персонаж не найден</h2>
            <Link to="/characters">Вернуться к списку</Link>
        </div>
    );
  }

  return (
    <div className="character-detail-container">
      <img src={character.thumbnail} alt={character.name} className="character-detail-image" />
      <div className="character-detail-info">
            <h1>{character.name}</h1>
            <p className="character-detail-description">{character.description}</p>
            
            {/* Секция характеристик */} 
            {character.characteristics && character.characteristics.length > 0 && (
                <div className="character-detail-section">
                    <h2>Характеристики:</h2>
                    <ul className="characteristics-list"> {/* Добавляем класс для стилизации */} 
                        {character.characteristics.map((char, index) => (
                            <li key={index}>
                                <span className="char-name">{char.name}:</span> 
                                <span className="char-value">{char.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Секция способностей */} 
            <div className="character-detail-section">
                <h2>Способности:</h2>
                <ul>
                    {character.abilities.map((ability, index) => (
                        <li key={index}>{ability}</li>
                    ))}
                </ul>
            </div>

            {/* Секция первого появления */} 
            <div className="character-detail-section">
                <h2>Первое появление:</h2>
                <p>{character.firstAppearance}</p>
            </div>

            <Link to="/characters" className="back-to-list-link">← Вернуться к списку</Link>
        </div>
    </div>
  );
};

export default CharacterDetailPage; 