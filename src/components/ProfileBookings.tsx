// components/ProfileBookings.tsx
'use client';

import { useState, useEffect } from 'react';
import { bookings } from '../lib/api';

interface Booking {
  id: number;
  room: { name: string };
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
}

interface Props {
  activeTab: string;
}

export default function ProfileBookings({ activeTab }: Props) {
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Fetching bookings...');
    bookings.getAll().then(res => {
      console.log('Bookings received:', res.data);
      setBookingsList(res.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    });
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Ожидает оплаты';
      case 'paid': return 'Оплачено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const filteredBookings = bookingsList.filter(b => {
    if (activeTab === 'active') {
      return b.status !== 'cancelled';
    }
    return true;
  });

  const handlePay = async (id: number) => {
    if (confirm('Оплатить бронирование?')) {
      try {
        await bookings.pay(id);
        // Обновить список
        setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b));
      } catch (error) {
        alert('Ошибка оплаты');
      }
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('Отменить бронирование?')) {
      try {
        await bookings.cancel(id);
        // Обновить список
        setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      } catch (error) {
        alert('Ошибка отмены');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Загрузка броней...</div>;

  if (filteredBookings.length === 0) {
    return <div className="text-center py-8 text-gray-400">Нет броней</div>;
  }

  return (
    <div className="space-y-4">
      {filteredBookings.map(b => (
        <div key={b.id} className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-yellow-400">{b.room.name}</h3>
              <p className="text-gray-300">
                {new Date(b.check_in_date).toLocaleDateString('ru-RU')} - {new Date(b.check_out_date).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm ${
                b.status === 'paid' ? 'bg-green-600' :
                b.status === 'pending_payment' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {getStatusText(b.status)}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Сумма: {b.total_price} ₽</p>
            <div className="space-x-2">
              {b.status === 'pending_payment' && (
                <button
                  onClick={() => handlePay(b.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                >
                  Оплатить
                </button>
              )}
              {b.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  Отменить
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}