// app/page.tsx — ФИНАЛЬНАЯ ВЕРСИЯ (рекомендую именно её)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { roomTypes, RoomType } from "../lib/api";
import RoomCard from "../components/RoomCard";


export default function Home() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Загрузка всех номеров при монтировании компонента
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const response = await roomTypes.getAll();
        setRooms(response.data);
      } catch (error) {
        console.error("Ошибка загрузки номеров:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert("Выберите даты заезда и выезда");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }

    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests: guests.toString(),
    });

    router.push(`/room-types?${params.toString()}`);
  };

  // Минимальная валидация для даты выезда
  const minCheckoutDate = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
    : "";

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/1.png"
          alt="HostelStay"
          fill
          className="object-cover brightness-50"
          priority
        />

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            HostelStay
          </h1>
          <p className="text-xl md:text-3xl mb-12 font-light">
            Уютный хостел в самом сердце Волгограда
          </p>

          {/* Форма поиска */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm mb-2">Заезд</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Выезд</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={minCheckoutDate}
                  className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Гости</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "гость" : n < 5 ? "гостя" : "гостей"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transform transition hover:scale-105 active:scale-95"
                >
                  Найти номера
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Секция с номерами */}
      <section className="container mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Наши номера
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Выберите из нашего уютного и современного размещения в самом центре Волгограда
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="ml-4 text-xl">Загрузка номеров...</span>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                // НОВЫЕ СВОЙСТВА: Передаем параметры бронирования
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">Номера временно недоступны</p>
          </div>
        )}
      </section>

      {/* Контакты и карта */}
      <section className="container mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Где мы находимся</h2>
        <div className="grid md:grid-cols-2 gap-10 bg-[#272727] rounded-3xl overflow-hidden border-4 border-[#FFB200]">
          <div className="p-10 space-y-6">
            <h3 className="text-3xl font-bold">Контакты</h3>
            <p><strong>Телефон:</strong> <a href="tel:+79033384141" className="text-orange-400 hover:underline">+7 (903) 338-41-41</a></p>
            <p><strong>Email:</strong> <a href="mailto:HostelOtel@host.fun" className="text-orange-400 hover:underline">HostelOtel@host.fun</a></p>
            <p><strong>Адрес:</strong> ул. М. Балонина, 7, Волгоград</p>
          </div>
          <div className="h-96 md:h-full min-h-96">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A33190e820a6928889efb7ebecce1ac842c7a26da7e5b11f85904d03321bb9ab8&amp;source=constructor"
              width="100%"
              height="100%"
              frameBorder="0"
              className="rounded-r-3xl"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}