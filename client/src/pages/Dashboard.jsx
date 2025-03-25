import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices } from '../redux/slices/deviceSlice';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { devices, loading, error } = useSelector(state => state.devices);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error.message}</div>;

  return (
    <div>
      <h1>Мої пристрої</h1>
      {devices.length === 0 ? (
        <p>У вас ще немає зареєстрованих пристроїв</p>
      ) : (
        <div>
          {devices.map(device => (
            <div key={device._id}>
              <Link to={`/device/${device._id}`}>
                <h3>Пристрій {device.serialNumber}</h3>
                <p>Рівень заповнення: {device.fillLevel}%</p>
                <p>Статус: {device.status}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;