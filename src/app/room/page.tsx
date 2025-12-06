'use client';

import { useState } from 'react';
import RoomCard from '@/components/RoomCard';

export default function RoomsPage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!checkIn || !checkOut) return alert('Выберите даты');

    setLoading(true);
    const res = await fetch(
      `/api/rooms/available?check_in=${checkIn}&check_out=${checkOut}`
    );
    const data = await res.json();
    setRooms(data.data || data);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Доступные порпрорпопропрномера</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-10 flex gap-4 flex-wrap">
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border rounded-lg px-4 py-3 flex-1 min-w-64"
        />
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border rounded-lg px-4 py-3 flex-1 min-w-64"
        />
        <button
          onClick={search}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Найти
        </button>
      </div>

      {loading && <p className="text-center">Ищем свободные номера...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room: any, i: number) => (
          <RoomCard key={i} room={room} />
        ))}
      </div>

      {!loading && rooms.length === 0 && checkIn && (
        <p className="text-center text-xl text-gray-500 mt-20">
          На выбранные даты нет свободных номеров
        </p>
      )}
    </div>
  );
}