// app/booking/steps/Step2.tsx
"use client";

import { useEffect } from "react";
import { BookingData } from "../../../types/room";

interface Step2Props {
  data: BookingData;
  setData: (updater: (prev: BookingData) => BookingData) => void;
  next: () => void;
  prev: () => void;
}

// Функция для формирования URL изображения
const getPhotoUrl = (photos: string[] | null | undefined): string => {
  const API_URL = 'http://127.0.0.1:8000';
  const PLACEHOLDER = '/placeholder.jpg';
  const photoArray = Array.isArray(photos) ? photos : [];
  
  if (photoArray.length === 0) return PLACEHOLDER;
  
  const photoPath = photoArray[0];
  const clean = photoPath.replace(/^\/+/g, '');
  
  if (clean.includes('rooms/') || clean.includes('storage/')) {
    return `${API_URL}/${clean.startsWith('storage/') ? clean : 'storage/' + clean}`;
  }
  
  return `${API_URL}/storage/rooms/${clean}`;
};

export default function Step2({ data, setData, next, prev }: Step2Props) {
  // Пересчитываем цену при изменении дат
  useEffect(() => {
    if (!data.checkIn || !data.checkOut || !data.room) {
      setData((prev) => ({ ...prev, totalPrice: 0 }));
      return;
    }

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkOut <= checkIn) {
      setData((prev) => ({ ...prev, totalPrice: 0 }));
      return;
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const total = nights * data.room.cheapest_price;

    setData((prev) => ({ ...prev, totalPrice: total }));
  }, [data.checkIn, data.checkOut, data.room]);

  return (
    <div className="bg-gray-800 rounded-2xl p-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Выберите даты</h2>

      {/* Информация о выбранном номере */}
      {data.room && (
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden">
              <img
                src={getPhotoUrl(data.room?.photos)}
                alt={data.room?.type_name || "Номер"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{data.room.type_name}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  от {data.room.cheapest_price.toLocaleString()} ₽/ночь
                </span>
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  до {data.room.capacity} гостей
                </span>
              </div>
              {data.room.amenities && data.room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.room.amenities
                    .slice(0, 6)
                    .map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="text-gray-300 text-sm bg-gray-800 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-lg mb-3 text-yellow-400">Заезд</label>
          <input
            type="date"
            value={data.checkIn || ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) =>
              setData((prev) => ({ ...prev, checkIn: e.target.value }))
            }
            className="w-full p-4 bg-gray-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-lg mb-3 text-yellow-400">Выезд</label>
          <input
            type="date"
            value={data.checkOut || ""}
            min={
              data.checkIn
                ? new Date(data.checkIn).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setData((prev) => ({ ...prev, checkOut: e.target.value }))
            }
            className="w-full p-4 bg-gray-700 rounded-xl text-white"
          />
        </div>
      </div>

      <div className="text-center py-8 bg-gray-900 rounded-xl mb-8">
        <p className="text-5xl font-bold text-yellow-500">
          {data.totalPrice > 0 ? data.totalPrice.toLocaleString() : "0"} ₽
        </p>
        <p className="text-gray-400 mt-2">
          {data.checkIn && data.checkOut && data.totalPrice > 0
            ? `за ${Math.ceil(
                (new Date(data.checkOut).getTime() -
                  new Date(data.checkIn).getTime()) /
                  (1000 * 60 * 60 * 24)
              )} ночей`
            : "Выберите даты"}
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={prev} className="px-8 py-4 bg-gray-700 rounded-xl">
          ← Назад
        </button>
        <button
          onClick={next}
          disabled={!data.checkIn || !data.checkOut || data.totalPrice === 0}
          className="px-12 py-4 bg-yellow-500 text-black font-bold rounded-xl disabled:opacity-50"
        >
          Продолжить →
        </button>
      </div>
    </div>
  );
}
