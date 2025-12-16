// app/room-types/[id]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { roomTypes } from "@/lib/api"; // оставил как у тебя

const API_URL = "http://127.0.0.1:8000";

// Полный URL к фото
const getPhotoUrl = (path?: string): string => {
  if (!path) return "";

// Если путь уже полный URL (начинается с http), возвращаем как есть
if (path.startsWith('http')) {
  return path;
}

// Если путь начинается с /storage/, возвращаем полный URL
if (path.startsWith('/storage/')) {
  return `${API_URL}${path}`;
}

// Если путь начинается с storage/, добавляем слеш в начало
if (path.startsWith('storage/')) {
  return `${API_URL}/${path}`;
}

// Если путь уже содержит rooms/ (например, rooms/filename.jpg), просто добавляем /storage/ в начало
if (path.startsWith('rooms/')) {
  return `${API_URL}/storage/${path}`;
}

// Для простых имен файлов добавляем /storage/ в начало
return `${API_URL}/storage/${path}`;
};

export default function RoomDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // Date inputs state
  const [checkIn, setCheckIn] = useState<string>(searchParams.get("check_in") || "");
  const [checkOut, setCheckOut] = useState<string>(searchParams.get("check_out") || "");
  const [guests, setGuests] = useState<string>(searchParams.get("guests") || "1");
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // booking params for "back" links
  const bookingParams = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    guests: guests,
  }).toString();

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const response = await roomTypes.getById(params.id as string);
        const roomData = response.data;

        const normalized = {
          ...roomData,
          type_name: roomData.type_name || roomData.name || "Номер без названия",
          cheapest_price: roomData.cheapest_price || roomData.price_per_night || 0,
          photos:
            roomData.photos && roomData.photos.length > 0
              ? roomData.photos
              : [roomData.photo || ""],
          amenities:
            roomData.amenities && roomData.amenities.length > 0
              ? roomData.amenities
              : roomData.features || [],
          description: roomData.description || "Описание отсутствует",
          short_name:
            roomData.short_name ||
            (roomData.type_name ? roomData.type_name.substring(0, 3).toUpperCase() : "ПСБ"),
        };

        setRoom(normalized);
      } catch (err: any) {
        console.error("Ошибка при загрузке номера:", err);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [params.id]);

  // date constraints
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!checkIn) setCheckIn(searchParams.get("check_in") || "");
    if (!checkOut) setCheckOut(searchParams.get("check_out") || "");
    // ensure checkIn min won't be in the past for manual edits (UI-level)
    if (checkIn && checkIn < today) setCheckIn(today);
  }, []);

  // update total price when dates or room change
  useEffect(() => {
    if (!room) {
      setTotalPrice(0);
      return;
    }
    if (checkIn && checkOut) {
      const days = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days > 0) setTotalPrice(days * Number(room.cheapest_price || 0));
      else setTotalPrice(0);
    } else {
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, room]);


  // keyboard navigation for modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) {
        if (e.key === "Escape") setModalOpen(false);
        if (e.key === "ArrowLeft") setModalIndex((i) => (i - 1 + (room?.photos?.length || 0)) % (room?.photos?.length || 1));
        if (e.key === "ArrowRight") setModalIndex((i) => (i + 1) % (room?.photos?.length || 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, room]);

  // open modal
  const openModal = (index = 0) => {
    setModalIndex(index);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
  };


  const handleBook = () => {
    if (!checkIn || !checkOut) {
      alert("Пожалуйста, выберите даты заезда и выезда");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }

    const bookingParams = new URLSearchParams({
      roomId: room?.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
    }).toString();

    router.push(`/booking?${bookingParams}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C5A968] border-t-transparent"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#292929] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Номер не найден</h2>
          <Link href={`/room-types?${bookingParams}`} className="bg-[#C5A968] text-white px-8 py-3 rounded-xl text-lg font-bold">
            Вернуться назад
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(room.cheapest_price || 0).toLocaleString("ru-RU");

  // normalized amenities (accepting both strings and objects)
  const amenitiesList: string[] = (room.amenities || []).map((it: any) =>
    typeof it === "string" ? it : it.name || String(it)
  );

  const photos = room.photos && room.photos.length > 0 ? room.photos : [""];
  const sliderPhotos = photos.map((p: string) => {
    const url = getPhotoUrl(p);
    console.log('Generated photo URL:', url, 'from path:', p);
    return url;
  });

  return (
    <div className="min-h-screen container mx-auto text-white font-sans py-10 px-4 bg-[#1A1A1A]">
      <h1 className="text-center text-3xl font-bold mb-8 tracking-wide">Подробнее о номере</h1>

      <div className="bg-[#4A4949] rounded-lg p-6 lg:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: slider + description button */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                className="h-full"
              >
                {sliderPhotos.map((src: string, idx: number) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={src}
                        alt={`${room.type_name} - фото ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover cursor-pointer"
                        onClick={() => openModal(idx)}
                        priority={idx === 0}
                        onError={(e) => {

                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <button
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className="w-full bg-[#333333] hover:bg-[#3d3d3d] text-white py-3 px-6 rounded-md flex justify-between items-center transition-colors font-semibold"
            >
              <span>Описание</span>
              <span className={`transform transition-transform ${isDescriptionOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {isDescriptionOpen && (
              <div className="mt-2 bg-[#272727] rounded-xl p-4">
                <div className="text-white text-sm leading-relaxed text-start">
                  <div dangerouslySetInnerHTML={{ __html: room.description || "Описание отсутствует" }} />
                </div>
              </div>
            )}
          </div>

          {/* Right column: info + booking widget */}
          <div className="text-start">
            <h2 className="text-2xl font-bold text-white leading-tight">{room.type_name}</h2>
            <p className="text-white font-medium mt-1 uppercase tracking-widest text-lg">{room.short_name}</p>

            <div className="bg-[#333333] rounded-xl p-6 lg:p-8 flex flex-col h-fit mt-4 p-0">
              {/* Price */}
              <div className="mb-6 text-start flex justify-between ">
                <div>
                <span className="text-white text-sm align-top mr-1">от</span>
                <span className="text-white text-2xl font-light">{price}₽</span>
                </div>
                <div className="text-sm text-gray-400">за ночь</div>
              </div>

              {/* Amenities tags */}
              <div className="mb-6">
                <h3 className="text-white text-ls mb-5 font-medium border-b pb-5 text-start border-[#FFB200]">Привилегии данного номера</h3>
                <div className="flex flex-wrap gap-3">
                  {amenitiesList.map((item: string, idx: number) => (
                    <div key={idx} className="border border-[#FFB200] text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking widget (dates, guests, total) */}
              <div className="w-full bg-[#272727] rounded-xl p-4 mb-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-[#FFB200] mb-1">от {price}₽</div>
                  <div className="text-sm text-gray-400">за ночь</div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Заезд</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCheckIn(val);
                        // set checkout min to next day if needed
                        if (val) {
                          const nextDay = new Date(val);
                          nextDay.setDate(nextDay.getDate() + 1);
                          if (checkOut && checkOut < nextDay.toISOString().split("T")[0]) {
                            setCheckOut("");
                          }
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Выезд</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={checkOut}
                      min={checkIn ? (() => { const d = new Date(checkIn); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })() : ""}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Гости</label>
                    <select className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500" value={guests} onChange={(e) => setGuests(e.target.value)}>
                      <option value="1">1 гость</option>
                      <option value="2">2 гостя</option>
                      <option value="3">3 гостя</option>
                      <option value="4">4 гостя</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span>Общая стоимость:</span>
                    <span className="font-bold text-[#FFB200]">{totalPrice > 0 ? `${totalPrice.toLocaleString("ru-RU")}₽` : "0₽"}</span>
                  </div>
                </div>

                <button onClick={handleBook} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform transition hover:scale-105">
                  Забронировать
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Big description/amenities/rules area below (two-column main + sidebar in original HTML) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#272727] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Удобства</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenitiesList.length ? amenitiesList.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <i className="bx bx-check text-[#FFB200]"></i>
                    <span>{a}</span>
                  </div>
                )) : <p className="text-gray-400">Удобства отсутствуют</p>}
              </div>
            </section>



            <section className="bg-[#272727] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Правила</h2>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3"><i className="bx bx-check text-green-500 mt-1"></i><span>Заезд после 14:00, выезд до 12:00</span></div>
                <div className="flex items-start gap-3"><i className="bx bx-check text-green-500 mt-1"></i><span>Разрешено курение в специально отведенных местах</span></div>
                <div className="flex items-start gap-3"><i className="bx bx-check text-green-500 mt-1"></i><span>Разрешено проживание с домашними животными</span></div>
                <div className="flex items-start gap-3"><i className="bx bx-x text-red-500 mt-1"></i><span>Вечеринки и мероприятия запрещены</span></div>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="bg-[#272727] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Связаться с нами</h3>
              <div className="space-y-3">
                <a href="tel:+79033384141" className="flex items-center gap-3 text-[#FFB200] hover:text-[#FFB200]/80"><i className="bx bx-phone"></i><span>+7 (903) 338-41-41</span></a>
                <a href="mailto:HostelOtel@host.fun" className="flex items-center gap-3 text-[#FFB200] hover:text-[#FFB200]/80"><i className="bx bx-envelope"></i><span>HostelOtel@host.fun</span></a>
              </div>
            </div>

            <div className="bg-[#272727] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Расположение</h3>
              <div className="h-48 rounded-lg overflow-hidden">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A33190e820a6928889efb7ebecce1ac842c7a26da7e5b11f85904d03321bb9ab8&source=constructor"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">ул. М. Балонина, 7, Волгоград</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button onClick={closeModal} className="absolute top-6 right-6 text-white hover:text-[#FFB200] text-4xl z-10">
            <i className="bx bx-x"></i>
          </button>
          <button onClick={() => setModalIndex((i) => (i - 1 + sliderPhotos.length) % sliderPhotos.length)} className="absolute left-6 text-white hover:text-[#FFB200] text-4xl z-10">
            <i className="bx bx-chevron-left"></i>
          </button>
          <button onClick={() => setModalIndex((i) => (i + 1) % sliderPhotos.length)} className="absolute right-6 text-white hover:text-[#FFB200] text-4xl z-10">
            <i className="bx bx-chevron-right"></i>
          </button>

          <div className="max-w-[90%] max-h-[90%]">
            <img src={sliderPhotos[modalIndex]} alt={`Фото ${modalIndex + 1}`} className="max-w-full max-h-full object-contain" />
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
            <span>{modalIndex + 1} / {sliderPhotos.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
