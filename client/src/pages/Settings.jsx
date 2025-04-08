import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/settings.css';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditable, setIsEditable] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const navigate = useNavigate();

  const handleEditToggle = () => {
    setIsEditable((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    alert('Profile changes saved successfully!');
    // Тут можна викликати dispatch чи іншу логіку збереження
    setIsEditable(false);
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSaveAndReturn = () => {
    navigate('/profile');
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <section>
        <h2>Profile</h2>
        <form>
          <label>
            Name:
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </label>
          <br />
          <button
            type="button"
            className="edit-button"
            onClick={handleEditToggle}
          >
            {isEditable ? 'Cancel' : 'Edit'}
          </button>
          {isEditable && (
            <button
              type="button"
              className="save-button"
              onClick={handleSaveChanges}
            >
              Save
            </button>
          )}
        </form>
      </section>
      <section>
        <h2>Preferences</h2>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeToggle}
          />
          Enable Dark Mode
        </label>
      </section>
      <section>
        <h2>Security</h2>
        <button>Change Password</button>
      </section>
      <div className="save-return-container">
        <button className="save-return-button" onClick={handleSaveAndReturn}>
          Save Settings and Return to Profile
        </button>
      </div>
    </div>
  );
};

export default Settings;