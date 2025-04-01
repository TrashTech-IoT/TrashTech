import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices } from '../redux/slices/deviceSlice';
import { Link } from 'react-router-dom';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 11) return "Доброго ранку";
  if (hour >= 12 && hour <= 18) return "Доброго дня";
  if (hour >= 19 && hour <= 22) return "Доброго вечора";
  return "Доброго ночі";
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { devices, loading, error } = useSelector(state => state.devices);
  const user = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  if (loading) return <div className="text-center p-4">Завантаження...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Помилка: {error.message}</div>;

  // Define the device variable
  const device = devices.length > 0 ? devices[0] : null;

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Мій кабінет</h1>
      <p className="text-lg">{getGreeting()}, {user?.username || 'Користувач'}!</p>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {devices.length === 0 ? (
          <p>У вас ще немає зареєстрованих пристроїв</p>
        ) : (
          <>
            <div className="p-4 border rounded-md shadow">
              <h2 className="font-semibold">Рівень заповнення</h2>
              {device ? (
                <p>{device.fillLevel}%</p>
              ) : (
                <p>Дані відсутні</p>
              )}
            </div>

            <div className="p-4 border rounded-md shadow text-center">
              <h2 className="font-semibold">Підключення</h2>
              <p className={device && device.status === 'Connected' ? "text-green-500" : "text-red-500"}>
                {device ? device.status : 'Немає даних'}
              </p>
            </div>

            <div className="p-4 border rounded-md shadow text-center">
              <h2 className="font-semibold">Відкрито/Закрито</h2>
              <p className={device && device.isOpen ? "text-red-500" : "text-green-500"}>
                {device ? (device.isOpen ? 'Відкрито' : 'Закрито') : 'Немає даних'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;