import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices } from '../redux/slices/deviceSlice';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';
import '../index.css';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 11) return "Доброго ранку";
  if (hour >= 12 && hour <= 18) return "Доброго дня";
  if (hour >= 19 && hour <= 22) return "Доброго вечора";
  return "Доброї ночі";
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.devices);
  const user = useSelector(state => state.user);
  
  const [fillHistory, setFillHistory] = useState([]);
  const [currentFillLevel, setCurrentFillLevel] = useState(null);
  const [userDevices, setUserDevices] = useState([]);
  
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);
  
  useEffect(() => {
    const fetchFillHistory = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/device/trash/fillLevelHistory');
        setFillHistory(data.fillLevelHistory || []);
      } catch (err) {
        console.error('Помилка при отриманні історії:', err);
      }
    };
    fetchFillHistory();
  }, []);
  
  useEffect(() => {
    const fetchCurrentFillLevel = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/device/trash/fillLevel');
        setCurrentFillLevel(data.fillLevel || null);
      } catch (err) {
        console.error('Помилка при отриманні актуального рівня наповнення:', err);
      }
    };
    fetchCurrentFillLevel();
    
    const interval = setInterval(fetchCurrentFillLevel, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserDevices = async () => {
      try {
        const { data } = await axios.get('/api/users/devices-list');
        setUserDevices(data);
      } catch (error) {
        console.error('Error fetching user devices:', error);
      }
    };
    fetchUserDevices();
  }, []);
  
  if (loading) return <div className="loading-message">Завантаження...</div>;
  if (error) return <div className="error-message">Помилка: {error.message}</div>;
    
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Дашборд</h1>
        <p className="dashboard-greeting">{getGreeting()}, {user?.username || 'Користувач'}!</p>
      </div>
      
      {userDevices.length === 0 ? (
        <div className="no-devices-message">
          У вас ще немає зареєстрованих пристроїв
        </div>
      ) : (
        <div className="device-cards-container">
          {userDevices.map(device => (
            <div className="device-card" key={device._id}>
              <div className="device-info-row">
                <div className="device-info-item">
                  <h3 className="device-card-header">Серійний номер</h3>
                  <div className={`device-card-content ${device.status === 'online' ? 'online' : 'offline'}`}>
                    {device.serialNumber}
                  </div>
                </div>
                <div className="device-info-item">
                  <h3 className="device-card-header">Статус</h3>
                  <div className={`device-card-content ${device.status === 'online' ? 'online' : 'offline'}`}>
                    {device.status}
                  </div>
                </div>
                <div className="device-info-item">
                  <h3 className="device-card-header">Додано</h3>
                  <div className="device-card-content">
                    {new Date(device.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Контейнер для історії та актуального рівня наповнення */}
      <div className="data-sections-container">
        {/* Блок для історії, з вертикальною прокруткою */}
        <div className="history-section">
          <h3 className="history-title">Історія рівня заповнення</h3>
          <div className="history-content">
            {fillHistory.length === 0 ? (
              <div className="no-devices-message">Немає даних про історію наповнення</div>
            ) : (
              fillHistory.map((item, index) => (
                <div className="history-item" key={index}>
                  <span className="history-timestamp">
                    Час: {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="history-level">
                    Рівень: {item.level}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Блок для актуального рівня наповнення */}
        <div className="current-fill-section">
          <h3 className="current-fill-title">Актуальний рівень наповнення</h3>
          <div className="current-fill-content">
            {currentFillLevel === null ? (
              <div className="no-devices-message">Немає даних про актуальний рівень</div>
            ) : (
              <div className="current-fill-display">
                <div 
                  className="current-fill-indicator" 
                  style={{"--fill-percent": `${currentFillLevel}%`}}
                  data-percent={`${currentFillLevel}%`}
                ></div>
                <div className="current-fill-info">
                  <div className="current-fill-percentage">{currentFillLevel}%</div>
                  <div className="current-fill-timestamp">
                    Оновлено: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;