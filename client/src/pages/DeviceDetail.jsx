import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DeviceDetail = () => {
  const { id } = useParams();
  const { devices } = useSelector(state => state.devices);
  const device = devices.find(d => d._id === id);

  if (!device) return <div>Пристрій не знайдено</div>;

  return (
    <div>
      <h1>Деталі пристрою</h1>
      <p>Серійний номер: {device.serialNumber}</p>
      <p>Рівень заповнення: {device.fillLevel}%</p>
      <p>Статус: {device.status}</p>
      <p>Місцезнаходження: {device.location.coordinates.join(', ')}</p>
      <p>Останній раз активований: {new Date(device.lastActivity).toLocaleString()}</p>
    </div>
  );
};

export default DeviceDetail;