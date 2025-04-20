import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import MiniGame from './pages/MiniGame';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import IndexedDB from './database/indexedDb';
import UserProfile from './pages/UserProfile';
import MarvelHistory from './pages/MarvelHistory';
import CharactersListPage from './pages/CharactersListPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import Achievements from './pages/Achievements';

// Инициализируем базу данных при запуске приложения
const db = IndexedDB.getInstance();

// Компонент для защиты маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userId = localStorage.getItem('userId');
  console.log('ProtectedRoute check, userId:', userId);
  if (!userId) {
    console.log('Redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/marvel-history" element={<MarvelHistory />} />
          <Route path="/characters" element={<CharactersListPage />} />
          <Route path="/characters/:characterId" element={<CharacterDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minigame"
            element={
              <ProtectedRoute>
                <MiniGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
