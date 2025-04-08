import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/settings.css';

const Settings = () => {
    const [userData, setUserData] = useState({ username: '', email: '' });
    const [isEditable, setIsEditable] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Имитация загрузки данных из базы данных
    useEffect(() => {
        const fetchUserData = async () => {
            const data = { username: 'JohnDoe', email: 'johndoe@example.com' }; // Пример данных
            setUserData(data);
        };
        fetchUserData();
    }, []);

    const handleEditToggle = () => {
        setIsEditable(!isEditable);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveChanges = () => {
        // Здесь вы можете отправить данные на сервер для сохранения
        alert('Profile changes saved successfully!');
        setIsEditable(false);
    };

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
    };

    const handleSaveAndReturn = () => {
        // Здесь можно добавить логику сохранения настроек
        navigate('/profile'); // Перенаправляем на страницу профиля
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