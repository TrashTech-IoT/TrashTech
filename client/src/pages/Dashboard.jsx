import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices } from '../redux/slices/deviceSlice';
import axios from '../utils/axios';
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
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [newDeviceSerial, setNewDeviceSerial] = useState('');
  const [expandedDevice, setExpandedDevice] = useState(null);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  useEffect(() => {
    if (!expandedDevice) return;
    const fetchFillHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          `/api/dashboard/device/${expandedDevice}/fillLevelHistory`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFillHistory(data.fillLevelHistory || []);
      } catch (err) {
        console.error('Помилка при отриманні історії:', err);
      }
    };
    fetchFillHistory();
    const historyInterval = setInterval(fetchFillHistory, 800);
    return () => clearInterval(historyInterval);
  }, [expandedDevice]);

  useEffect(() => {
    if (!expandedDevice) return;
    const fetchCurrentFillLevel = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          `/api/dashboard/device/${expandedDevice}/fillLevel`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentFillLevel(data.fillLevel ?? null);
      } catch (err) {
        console.error('Помилка при отриманні актуального рівня наповнення:', err);
      }
    };
    fetchCurrentFillLevel();
    const levelInterval = setInterval(fetchCurrentFillLevel, 800);
    return () => clearInterval(levelInterval);
  }, [expandedDevice]);

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

  const handleAddDevice = async () => {
    if (!newDeviceSerial) {
      alert('Будь ласка, введіть серійний номер пристрою.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(
        '/api/devices/device-add',
        { serialNumber: newDeviceSerial }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setUserDevices(prevDevices => [...prevDevices, data]);
      alert('Пристрій успішно додано!');
      setIsModalOpen(false);
      setNewDeviceSerial('');
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Помилка при додаванні пристрою.');
    }
  };

  const handleDeleteDevice = async (serialNumber) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete('/api/devices/device-delete', {
        data: { serialNumber },
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(data.message);
      // Видаляємо девайс із локального списку
      setUserDevices((prev) => prev.filter((dev) => dev.serialNumber !== serialNumber));
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Error deleting device');
    }
  };

  if (loading) return <div className="loading-message">Завантаження...</div>;
  if (error) return <div className="error-message">Помилка: {error.message}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Дашборд</h1>
        <p className="dashboard-greeting">{getGreeting()}, {user?.username || 'Користувач'}!</p>
        <button className="add-device-button" onClick={() => setIsModalOpen(true)}>+</button>
      </div>

      {userDevices.length === 0 ? (
        <div className="no-devices-message">
          У вас ще немає зареєстрованих пристроїв
        </div>
      ) : (
        <div className="device-cards-container">
        {userDevices.map(device => (
          <div className="device-wrapper" key={device._id}>
            {/* сама карточка не міняє розмір */}
            <div
              className="device-card"
              onClick={() =>
                setExpandedDevice(prev =>
                  prev === device.serialNumber ? null : device.serialNumber
                )
              }
            >
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
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteDevice(device.serialNumber);
                }}
              >
                Delete
              </button>
            </div>
            </div>
        
            {/* блок з деталями під карточкою */}
            {expandedDevice === device.serialNumber && (
              <div className="data-sections-container">
                <div className="history-section">
                  <h3 className="history-title">Історія рівня заповнення</h3>
                  <div className="history-content">
                    {fillHistory.length === 0
                      ? <div className="no-devices-message">Немає даних</div>
                      : fillHistory.map((item,i) => (
                          <div className="history-item" key={i}>
                            <span className="history-timestamp">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                            <span className="history-level">{item.level}%</span>
                          </div>
                        ))
                    }
                  </div>
                </div>
                <div className="current-fill-section">
                  <h3 className="current-fill-title">Актуальний рівень</h3>
                  <div className="current-fill-content">
                    {currentFillLevel == null
                      ? <div className="no-devices-message">Немає даних</div>
                      : (
                        <div className="current-fill-display">
                          <div
                            className="current-fill-indicator"
                            style={{ "--fill-percent": `${currentFillLevel}%` }}
                          />
                          <div className="current-fill-info">
                            <div className="current-fill-percentage">
                              {currentFillLevel}%
                            </div>
                            <div className="current-fill-timestamp">
                              Оновлено: {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}        
        </div>
      )}

      {/* Модальне вікно для додавання пристрою */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Додати новий пристрій</h2>
            <input
              type="text"
              placeholder="Введіть серійний номер"
              value={newDeviceSerial}
              onChange={(e) => setNewDeviceSerial(e.target.value)}
            />
            <button className="add-device-submit" onClick={handleAddDevice}>Додати</button>
            <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>Закрити</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;