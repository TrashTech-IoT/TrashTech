import React from 'react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div>
      <h1>Профіль користувача</h1>
      <p>Ім&apos;я користувача: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Роль: {user.role}</p>
    </div>
  );
};

export default Profile;