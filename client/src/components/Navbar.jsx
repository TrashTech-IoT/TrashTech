import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import '../Navbar.css'
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const burgerRef = useRef(null);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen
        && menuRef.current
        && burgerRef.current
        && !menuRef.current.contains(e.target)
        && !burgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Логотип */}
        <div>
          <Link to="/">Smart Bin Моніторинг</Link>
        </div>
        
        <div className='desktop'>
          {isAuthenticated && (
            <>
              <Link to="/">Головна</Link>
              <Link to="/profile">Профіль</Link>
              <div className='line'>
                <span className="welcome">Вітаємо, {user?.username}</span>
                <button className= 'exit' onClick={handleLogout}>Вийти</button>
              </div>
            </>
          )}
        </div>
        
        {/* Бургер-іконка */}
        <div className="burger-icon" onClick={toggleMenu} ref={burgerRef}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Мобільне меню */}
        <div ref={menuRef} className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <div className="nav-links">
                <Link to="/" onClick={() => setMenuOpen(false)}>Головна</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Профіль</Link>
                <button className="exit" onClick={handleLogout}>Вийти</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Увійти</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Реєстрація</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;