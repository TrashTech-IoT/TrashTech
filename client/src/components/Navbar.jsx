import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import '../Navbar.css'

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/">Smart Bin Моніторинг</Link>
        {isAuthenticated ? (
          <>
            <Link to="/">Головна</Link>
            <Link to="/profile">Профіль</Link>
            <div className='line'>
            <span className='welcome'>Вітаємо, {user.username}</span>
            <button className= 'exit' onClick={handleLogout}>Вийти</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Увійти</Link>
            <Link to="/register">Реєстрація</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;