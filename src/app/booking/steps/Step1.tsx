// app/booking/steps/Step1.tsx
"use client";

import { useEffect, useState } from "react";
import { roomTypes } from "../../../lib/api";
import { RoomType, BookingData } from "../../../types/room";

interface Step1Props {
  data: BookingData;
  setData: (updater: (prev: BookingData) => BookingData) => void;
  next: () => void;
}

// Функция для формирования URL изображения
const getPhotoUrl = (photos: string[] | null | undefined): string => {
  const API_URL = "http://127.0.0.1:8000";
  const PLACEHOLDER = "/placeholder.jpg";
  const photoArray = Array.isArray(photos) ? photos : [];

  if (photoArray.length === 0) return PLACEHOLDER;

  const photoPath = photoArray[0];
  const clean = photoPath.replace(/^\/+/g, "");

  if (clean.includes("rooms/") || clean.includes("storage/")) {
    return `${API_URL}/${
      clean.startsWith("storage/") ? clean : "storage/" + clean
    }`;
  }

  return `${API_URL}/storage/rooms/${clean}`;
};

export default function Step1({ data, setData, next }: Step1Props) {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        let response;

        // Используем roomTypes.available, если даты и гости уже выбраны
        if (data.checkIn && data.checkOut && data.guests) {
          response = await roomTypes.available({
            check_in: data.checkIn,
            check_out: data.checkOut,
            guests: data.guests, // guests уже Number, API примет
          });
        } else {
          // Иначе — все типы номеров (это может быть большой список)
          response = await roomTypes.getAll();
        }

        setRooms(response.data);
      } catch (error) {
        console.error("Ошибка загрузки номеров:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
    // Обновляем список, если даты в `bookingData` изменились (например, вернулись с Шага 2)
  }, [data.checkIn, data.checkOut, data.guests]);

  if (loading)
    return <div className="text-center py-20">Загрузка номеров...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Выберите номер</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {rooms.map((room) => (
          <div
            key={room.slug}
            onClick={() => {
              setData((prev) => ({
                ...prev,
                room: room,
              }));
              next();
            }}
            className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:ring-4 hover:ring-yellow-500 transition-all"
          >
            <div className="relative h-64">
              <img
                src={getPhotoUrl(room.photos)}
                alt={room.type_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "/placeholder.jpg") {
                    target.src = "/placeholder.jpg";
                  }
                }}
              />
              <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 rounded-full">
                от {room.cheapest_price.toLocaleString()} ₽
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-3">{room.type_name}</h3>
              <div className="flex flex-wrap gap-3 text-sm mb-4">
                {room.amenities
                  ?.slice(0, 5)
                  .map((amenity: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-700 px-3 py-1 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
              </div>
              <button className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-400">
                Выбрать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
