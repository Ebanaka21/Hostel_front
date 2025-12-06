// app/room-types/page.tsx — РАБОЧАЯ ВЕРСИЯ

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RoomCard from "@/components/RoomCard";
import Link from "next/link";
import { roomTypes, RoomType } from "@/lib/api";


export default function RoomTypesPage() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const guests = Number(searchParams.get("guests")) || 1;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        let data;

        if (checkIn && checkOut) {
          // Если есть даты — ищем доступные
          const response = await roomTypes.available({
            check_in: checkIn,
            check_out: checkOut,
            guests: guests.toString(),
          });
          data = response.data;
        } else {
          // Иначе — все типы номеров
          const response = await roomTypes.getAll();
          data = response.data;
        }

        // Нормализуем: type_name должен быть всегда
        const normalized = data.map((room: any) => ({
          ...room,
          type_name: room.type_name || room.name || "Номер без названия",
          cheapest_price: room.cheapest_price || room.price_per_night || 0,
          photos: room.photos || [],
          amenities: room.amenities || [],
        }))as RoomType[];

        setRooms(normalized);
      } catch (err: any) {
        console.error("Ошибка при загрузке номеров:", err);
        if (err.message.includes("HTML")) {
          alert("Ошибка сервера. Проверь, запущен ли Laravel: php artisan serve");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [checkIn, checkOut, guests]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-6">Доступные номера</h1>

          {(checkIn || checkOut) && (
            <div className="inline-flex flex-wrap justify-center gap-4 bg-[#272727] px-8 py-5 rounded-2xl shadow-2xl text-lg">
              {checkIn && <span>Заезд: <strong>{formatDate(checkIn)}</strong></span>}
              {checkOut && <span className="text-orange-400">→</span>}
              {checkOut && <span>Выезд: <strong>{formatDate(checkOut)}</strong></span>}
              <span className="text-orange-400">•</span>
              <span>{guests} {guests === 1 ? "гость" : guests < 5 ? "гостя" : "гостей"}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-[#272727] rounded-3xl">
            <p className="text-3xl mb-8 text-gray-400">
              На выбранные даты нет свободных номеров
            </p>
            <Link
              href="/"
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-10 py-5 rounded-xl text-xl font-bold shadow-xl transition transform hover:scale-105"
            >
              Изменить даты
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.id || room.slug}
                room={{
                  ...room,
                  type_name: room.type_name || "Номер",
                  cheapest_price: room.cheapest_price,
                  photos: room.photos || [],
                  amenities: room.amenities || [],
                }}
                
                checkIn={checkIn || ''}
                checkOut={checkOut || ''}
                guests={guests}
                
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}