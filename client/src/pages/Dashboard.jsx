import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices } from '../redux/slices/deviceSlice';
import axios from '../utils/axios'; // <-- Використовуємо ваш axios-інстанс
import { Link } from 'react-router-dom';
import '../index.css'; // Імпортуємо стилі

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 11) return "Доброго ранку";
  if (hour >= 12 && hour <= 18) return "Доброго дня";
  if (hour >= 19 && hour <= 22) return "Доброго вечора";
  return "Доброї ночі";
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { devices, loading, error } = useSelector(state => state.devices);
  const user = useSelector(state => state.user);
  
  // Історія заповнення
  const [fillHistory, setFillHistory] = useState([]);
  // Актуальний рівень наповнення
  const [currentFillLevel, setCurrentFillLevel] = useState(null);
  
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);
  
  // Запит через axios-інстанс для історії заповнення
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
  
  // Запит через axios-інстанс для актуального рівня наповнення
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
    
    // Оновлюємо кожні 30 секунд
    const interval = setInterval(fetchCurrentFillLevel, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <div className="loading-message">Завантаження...</div>;
  if (error) return <div className="error-message">Помилка: {error.message}</div>;
  
  const device = devices.length > 0 ? devices[0] : null;
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Дашборд</h1>
        <p className="dashboard-greeting">{getGreeting()}, {user?.username || 'Користувач'}!</p>
      </div>
      
      {devices.length === 0 ? (
        <div className="no-devices-message">
          У вас ще немає зареєстрованих пристроїв
        </div>
      ) : (
        <div className="device-cards-container">
          <div className="device-card">
            <h3 className="device-card-header">Рівень заповнення</h3>
            {device ? (
              <div 
                className="fill-level-indicator" 
                style={{"--fill-percent": `${device.fillLevel}%`}} 
                data-percent={`${device.fillLevel}%`}
              ></div>
            ) : (
              <div className="device-card-content">Дані відсутні</div>
            )}
          </div>
          
          <div className="device-card">
            <h3 className="device-card-header">Підключення</h3>
            <div className={`device-card-content ${device?.status === 'online' ? 'online' : 'offline'}`}>
              {device ? device.status : 'Немає даних'}
            </div>
          </div>
          
          <div className="device-card">
            <h3 className="device-card-header">Відкрито/Закрито</h3>
            <div className={`device-card-content ${device?.isOpen ? 'open' : 'closed'}`}>
              {device ? (device.isOpen ? 'Відкрито' : 'Закрито') : 'Немає даних'}
            </div>
          </div>
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