import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import './styles/settings.css';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditable, setIsEditable] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
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

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/users/change-username',
        { newUsername: userData.username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Profile changes saved successfully!');
      setIsEditable(false);
    } catch (err) {
      console.error('Error changing username:', err);
      alert('Error changing username');
    }
  };
  

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSaveAndReturn = () => {
    navigate('/profile');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSavePassword = async () => {
    try {
      const token = localStorage.getItem('token'); 
      await axios.post(
        '/api/users/change-password',
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Password changed successfully!');
      setIsModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
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
        <button onClick={() => setIsModalOpen(true)}>Change Password</button>
      </section>
      <div className="save-return-container">
        <button className="save-return-button" onClick={handleSaveAndReturn}>
          Save Settings and Return to Profile
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Password</h2>
            <form>
              <label>
                Old Password:
                <input
                  type={showPasswords ? 'text' : 'password'} 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                />
              </label>
              <br />
              <label>
                New Password:
                <input
                  type={showPasswords ? 'text' : 'password'} 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={() => setShowPasswords((prev) => !prev)}
                />
                Show Passwords
              </label>
              <br />
              <button
                type="button"
                className="save-password-button"
                onClick={handleSavePassword}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="close-modal-button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;