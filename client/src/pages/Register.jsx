import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../redux/slices/authSlice';
import '../index.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register({ username, email, password }));
    
    if (result.type === 'auth/register/fulfilled') {
      navigate('/');
    }
  };

  return (
    <div className='card'>
      <div className='logo' id='forn-container'>
        <img src="/public/logo.png" alt="TrashTech Logo" />
      </div>
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Ім'я користувача" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Зареєструватися</button>
      </form>
    </div>
  );
};

export default Register;