import React from 'react';
import { useSelector } from 'react-redux';
import './styles/profile.css';
import { IoIosSettings } from "react-icons/io";
import { Link } from 'react-router-dom'; // Импортируем Link

const Profile = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className='profile-container'>
      <h1>Профіль користувача</h1>
      <p>Ім&apos;я користувача: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Роль: <span className="role">{user.role}</span></p>
      <div className='settings-container-icon'>
        <Link to="/settings"> 
          <IoIosSettings />
        </Link>
      </div>
    </div>
  );
};

export default Profile;