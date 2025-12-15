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
    ? new Date(new Date(checkIn).getTime() + 86400000)
        .toISOString()
        .split("T")[0]
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
          <div className="bg-black/20 backdrop-blur-xl p-5 px-20 rounded-3xl shadow-2xl border border-white/20">
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
                  className="w-full px-5 py-4 rounded-xl bg-[#4A4949] border border-white/30 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/50"
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Наши номера</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Выберите из нашего уютного и современного размещения в самом центре
            Волгограда
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="ml-4 text-xl">Загрузка номеров...</span>
          </div>
        ) : rooms.length > 0 ? (
          <div className="flex flex-col">
            {[...rooms].slice(-3).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
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
            <section className="w-full m-auto py-20">
  {/* TITLE */}
  <h2 className="text-center font-extrabold text-3xl mb-16 text-white">
    О ОТЕЛЕ
  </h2>

  {/* CONTENT ROW */}
  <div className="w-full bg-[#272727] rounded-lg p-10 flex flex-col md:flex-row gap-10 container m-auto ">

    {/* LEFT — TEXT BLOCK */}
    <div className="md:w-1/2 flex flex-col gap-6 text-white leading-relaxed border-r border-[#FFB200]">

      <p className="font-bold text-lg text-start">
        HostelStay — это не просто отель, а ваш дом вдали от дома. Мы предлагаем
        стильные номера с современным дизайном, где каждый гость чувствует себя
        особенным. Наслаждайтесь улучшенными стандартами по доступной цене,
        делюкс-апартаментами для семьи или премиум-вариантами с видом на город.
      </p>

      <div className="space-y-3 text-start">
        <p className=" text-xl ">Наши преимущества:</p>

        <ul className="space-y-2 font-bold text-[16px] ">
          <li>• Удобное расположение в центре города.</li>
          <li>• Бесплатный Wi-Fi, свежий завтрак и круглосуточный сервис.</li>
          <li>• Экологичные материалы и чистота на высшем уровне.</li>
        </ul>
      </div>

      <p className="text-[16px] font-light text-start">
        Забронируйте номер прямо сейчас и ощутите настоящую гостеприимность!
        Мы гарантируем безопасность (современные системы доступа) и незабываемые
        впечатления. <br /> <span className='font-bold'>Присоединяйтесь к тысячам довольных гостей HostelStay.</span>
      </p>

    </div>

    {/* RIGHT — IMAGE */}
    <div className="md:w-1/2 flex justify-center items-center">
      <img
        src="women.png"
        alt="hotel guest"
        className="w-full h-auto object-cover rounded-lg"
      />
    </div>

  </div>
    <div className='m-auto w-full py-10' >
      <a href="/room-types">
        <button className='text-center text-xl font-bold bg-[#656565] py-4 px-10 rounded-xl'>найти лучший номер</button>
      </a>
    </div>
</section>


    <section
      id="contacts"
      className="container mx-auto w-full text-white py-8 sm:py-12 px-3 sm:px-4"
    >
      <h2 className="text-center font-extrabold text-2xl sm:text-3xl md:text-4xl py-6 sm:py-8 mb-8 sm:mb-12">
        Где найти нас
      </h2>

      <div className="w-full max-w-6xl mx-auto">
        {/* Contact Info Card */}
        <div className="bg-[#272727] border border-[#FFB200]/30 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 text-center md:text-left">
            Связаться с нами
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Phone */}
            <div className="bg-[#1E1E1E] p-3 sm:p-4 rounded-xl border border-[#FFB200]/20 hover:border-[#FFB200]/50 transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <i className="bx bx-phone text-[#FFB200] text-lg sm:text-xl" />
                <span className="font-semibold text-sm sm:text-base">
                  Телефон
                </span>
              </div>
              <a
                href="tel:+79033384141"
                className="text-[#FFB200] hover:underline break-all text-sm sm:text-base"
              >
                +7 (903) 338-41-41
              </a>
            </div>

            {/* Email */}
            <div className="bg-[#1E1E1E] p-3 sm:p-4 rounded-xl border border-[#FFB200]/20 hover:border-[#FFB200]/50 transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <i className="bx bx-envelope text-[#FFB200] text-lg sm:text-xl" />
                <span className="font-semibold text-sm sm:text-base">
                  Почта
                </span>
              </div>
              <a
                href="mailto:HostelOtel@host.fun"
                className="text-[#FFB200] hover:underline break-all text-sm sm:text-base"
              >
                HostelOtel@host.fun
              </a>
            </div>

            {/* Address */}
            <div className="bg-[#1E1E1E] p-3 sm:p-4 rounded-xl border border-[#FFB200]/20 hover:border-[#FFB200]/50 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <i className="bx bx-map text-[#FFB200] text-lg sm:text-xl" />
                <span className="font-semibold text-sm sm:text-base">
                  Адрес
                </span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                ул. М. Балонина, 7
                <br />
                Волгоград, 400087
              </p>
            </div>
          </div>
        </div>

        {/* Map and Location Card */}
        <div className="bg-[#272727] border border-[#FFB200]/30 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="relative h-48 sm:h-64 md:h-80 lg:h-96">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A33190e820a6928889efb7ebecce1ac842c7a26da7e5b11f85904d03321bb9ab8&source=constructor"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Location Info */}
            <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center bg-[#1E1E1E] border-t lg:border-t-0 lg:border-l border-[#FFB200]/30">
              <div className="text-center lg:text-left">
                <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-[#FFB200]">
                  Наше расположение
                </h3>

                <div className="space-y-2 sm:space-y-3 text-gray-300">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <i className="bx bx-map-pin text-[#FFB200]" />
                    <p className="text-xs sm:text-sm leading-relaxed">
                      ул. М. Балонина, 7
                      <br />
                      Волгоград, 400087
                    </p>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <i className="bx bx-time text-[#FFB200]" />
                    <p className="text-xs sm:text-sm">Круглосуточно</p>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <i className="bx bx-walk text-[#FFB200]" />
                    <p className="text-xs sm:text-sm">5 мин от центра</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <a
                    href="https://yandex.ru/maps/38/volgograd/house/ulitsa_mikhaila_balonina_7/YE0YcwZgQEYPQFpifXtwcn9lZw==/?indoorLevel=1&ll=44.510938%2C48.713363&z=17.14"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#FFB200] text-black px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[#FFB200]/90 transition-colors text-center text-sm"
                  >
                    Открыть в картах
                  </a>

                  <a
                    href="tel:+79033384141"
                    className="border border-[#FFB200] text-[#FFB200] px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[#FFB200] hover:text-black transition-colors text-center text-sm"
                  >
                    Позвонить
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
