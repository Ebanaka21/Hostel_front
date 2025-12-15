// components/ProfileBookings.tsx
'use client';

import { useState, useEffect } from 'react';
import { bookings } from '../lib/api';

interface Booking {
  id: number;
  room: { id: number; name: string };
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
}

interface BookingResponse {
  id: number;
  room: {
    id: number;
    name: string;
    price_per_night: number;
    [key: string]: unknown;
  };
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
}

interface Props {
  activeTab: string;
  bookingsList: Booking[];
  loading: boolean;
  onPay: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function ProfileBookings({ activeTab, bookingsList, loading, onPay, onCancel, onDelete }: Props) {

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Ожидает оплаты';
      case 'paid': return 'Оплачено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-600';
      case 'pending_payment': return 'bg-gold';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
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
      await onPay(id);
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('Отменить бронирование?')) {
      await onCancel(id);
    }
  };

  const isBookingExpired = (checkOutDate: string): boolean => {
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    return checkOut < today;
  };

  const handleDeleteBooking = (id: number) => {
    if (confirm('Удалить бронирование?')) {
      onDelete(id);
    }
  };

  if (loading) return <div className="text-center py-8 text-gold">Загрузка...</div>;

  if (filteredBookings.length === 0) {
    return <div className="text-center py-8 text-gray-400">Нет броней</div>;
  }

  return (
    <div className="space-y-4">
      {filteredBookings.map(b => (
        <div key={b.id} className="bg-[#272727] rounded-xl p-4 sm:p-6 border border-[#FFB200]/20 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg sm:text-xl font-bold text-[#FFB200] mb-2">Бронирование #{b.id}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-300">
                <span className="flex items-center"><i className='bx bx-calendar mr-1'></i> {new Date(b.check_in_date).toLocaleDateString('ru-RU')} - {new Date(b.check_out_date).toLocaleDateString('ru-RU')}</span>
                <span className="flex items-center"><i className='bx bx-bed mr-1'></i> {b.room.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-[#FFB200] mb-2">{b.total_price}₽</div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                getStatusColor(b.status)
              }`}>
                {getStatusText(b.status)}
              </span>
            </div>
          </div>
          {/* Крестик в правом верхнем углу */}
          {(activeTab === 'active' && b.status === 'paid') ||
           (activeTab === 'all' && (b.status === 'cancelled' || isBookingExpired(b.check_out_date))) ? (
             <button
               onClick={() => handleDeleteBooking(b.id)}
               className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition text-2xl z-10"
               aria-label="Удалить бронирование"
             >
               <i className='bx bx-x'></i>
             </button>
           ) : null}

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {b.status === 'pending_payment' && (
                <>
                  <button
                    onClick={() => handlePay(b.id)}
                    className="bg-[#FFB200] text-black px-4 py-2 rounded-lg hover:bg-[#FFB200]/90 transition text-sm"
                  >
                    Оплатить
                  </button>
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Отменить
                  </button>
                </>
              )}
              {b.status === 'cancelled' && (
                <button
                  onClick={() => window.location.href = '/room-types'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Забронировать другой
                </button>
              )}
              {b.status === 'paid' && (
                <button
                  onClick={() => window.location.href = '/room-types'}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Забронировать еще
                </button>
              )}
            </div>
            <button
              onClick={() => window.location.href = `/room-types/${b.room.id}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm lg:ml-auto"
            >
              Подробно
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}