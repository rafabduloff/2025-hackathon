import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);

    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="layout">
      <nav className={`nav ${isMenuOpen ? 'menu-open' : ''}`}>
        <Link to="/" className="nav-logo" onClick={closeMenu}>
           MarvelApp 
        </Link>

        <div className={`nav-links-container ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Главная</NavLink>
          <NavLink to="/quiz" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Квиз</NavLink>
          <NavLink to="/minigame" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Мини-игра</NavLink>
          <NavLink to="/marvel-history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>История Marvel</NavLink>
          <NavLink to="/characters" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Персонажи</NavLink>
          <NavLink to="/achievements" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Достижения</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>О проекте</NavLink>
          <div className="auth-links mobile-auth-links">
            {isLoggedIn ? (
              <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link profile-link active" : "nav-link profile-link"} onClick={closeMenu}>Профиль</NavLink>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Войти</NavLink>
                <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Регистрация</NavLink>
              </>
            )}
          </div>
        </div>

        <div className="auth-links desktop-auth-links">
          {isLoggedIn ? (
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link profile-link active" : "nav-link profile-link"}>Профиль</NavLink>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Войти</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Регистрация</NavLink>
            </>
          )}
        </div>

        <button className="burger-menu" onClick={toggleMenu}>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Marvel Hackathon Project</p>
        <div className="footer-links">
           
        </div>
      </footer>
    </div>
  );
};

export default Layout; 