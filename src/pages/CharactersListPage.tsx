import React from 'react';
import { Link } from 'react-router-dom';
import { charactersData } from '../data/characters'; 
import CharacterCard from '../components/CharacterCard';
import '../styles/Characters.css'; 

const CharactersListPage: React.FC = () => {
  return (
    <div className="characters-list-container">
      <h1>Персонажи Marvel</h1>
      <div className="characters-grid">
        {charactersData.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
};

export default CharactersListPage; 
