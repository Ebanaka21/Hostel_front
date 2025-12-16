import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { RoomType, AmenityType } from '../lib/api';

const API_BASE_URL = "http://127.0.0.1:8000";

// Полный URL к фото
const getCardPhotoUrl = (path: string | undefined): string => {
  if (!path) return '';

  // Если путь уже полный URL (начинается с http), возвращаем как есть
  if (path.startsWith('http')) {
    return path;
  }

  // Если путь начинается с /storage/, возвращаем полный URL
  if (path.startsWith('/storage/')) {
    return `${API_BASE_URL}${path}`;
  }

  // Если путь начинается с storage/, добавляем слеш в начало
  if (path.startsWith('storage/')) {
    return `${API_BASE_URL}/${path}`;
  }

  // Если путь уже содержит rooms/ (например, rooms/filename.jpg), просто добавляем /storage/ в начало
  if (path.startsWith('rooms/')) {
    return `${API_BASE_URL}/storage/${path}`;
  }

  // Для простых имен файлов добавляем /storage/rooms/ в начало
  return `${API_BASE_URL}/storage/rooms/${path}`;
};

// Иконки удобств - только из базы данных
const getAmenityIcon = (amenity: string | AmenityType) => {
  // Если это объект AmenityType с icon_class, используем его
  if (typeof amenity === 'object' && amenity?.icon_class) {
    return amenity.icon_class;
  }
  
  // Если это строка, fallback на звездочку
};

interface RoomCardProps {
  room: RoomType;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function RoomCard({ room, checkIn, checkOut, guests = 1 }: RoomCardProps) {
  const roomName = room.name || room.type_name || 'Неизвестный номер';
  const roomPrice = room.price_per_night ?? room.cheapest_price ?? 0;
  const params = new URLSearchParams({
    check_in: checkIn || '',
    check_out: checkOut || '',
    guests: String(guests ?? 1),
  });

  const photos = room.photos || [];
  const shortTitle = (room.type_name || roomName).slice(0, 2).toUpperCase();

  // Защита от некорректных данных
  if (!roomName || roomPrice === undefined) {
    console.warn("RoomCard: Missing critical data", room);
    return null;
  }

  return (
    <section className="container mx-auto py-4 border-b-2 border-[#FFB200]">
      <div className="w-full bg-[#4A4949] border border-[#3A3A3A] rounded-lg p-4 md:p-6">
        
        {/* ============ ДЕСКТОП ВЕРСИЯ (горизонтальная) ============ */}
        <div className="hidden md:block hover:shadow-lg transition-shadow duration-300">
          <div className="flex md:flex-row gap-6">
            {/* LEFT: IMAGE + BUTTON */}
            <div className="w-full max-w-[520px] grid gap-4">
              {/* Внешняя рамка (темный фон + скругление) */}
              <div className="w-full bg-[#2E2D2D] rounded-2xl overflow-hidden p-4">
                {/* Контейнер слайдера: фиксированная высота, скругление */}
                <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-[#1f1f1f]">
                  {photos.length > 0 ? (
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      className="h-full"
                    >
                      {photos.map((photo, index) => (
                        <SwiperSlide key={index}>
                          <Image
                            src={getCardPhotoUrl(photo)}
                            alt={`Фото номера: ${roomName} - ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      Нет фото
                    </div>
                  )}
                </div>
              </div>

              {/* Большая кнопка Подробнее */}
              <Link href={`/room-types/${room.id}?${params.toString()}`}>
                <button className="w-full bg-[#1E1E1E] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#3A3A3A] transition">
                  Подробнее
                </button>
              </Link>
            </div>

            {/* RIGHT: INFO */}
            <div className="w-full justify-center">
              {/* Header: название + кнопка/цена */}
              <div className="flex w-full justify-between items-start mb-4">
                <h2 className="font-extrabold text-3xl text-white mr-4  break-words text-start">
                  {roomName}
                </h2>

                <div className="text-right flex-shrink-0">
                  <Link href={`/booking?roomId=${room.id}&check_in=${checkIn || ''}&check_out=${checkOut || ''}&guests=${guests}`}>
                    <button className="bg-[#1E1E1E] rounded-xl text-white px-5 py-3 text-lg font-semibold hover:bg-orange-600 transition duration-200">
                      Забронировать
                    </button>
                  </Link>

                  <p className="font-medium text-lg mt-1 text-white">
                    от {roomPrice}₽
                  </p>
                </div>
              </div>

              {/* Большая карточка удобств */}
              <div className="w-full bg-[#2E2D2D] border-2 border-[#333433] p-6 rounded-2xl">
                {/* Маленький код/заголовок слева */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-start font-bold text-xl text-white">{shortTitle}</p>
                </div>

                {/* Теги удобств — золото-рамка */}
                <div className="flex flex-wrap items-center gap-3 text-white mb-4">
                  {/* Динамические преимущества из базы данных */}
                  {room.amenities?.map((amenity, idx) => {
                    const amenityName = typeof amenity === 'string' ? amenity : amenity?.name || 'Преимущество';
                    return (
                      <div
                        key={idx}
                        className="border border-[#FFB200] text-white px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                        style={{ borderColor: '#c59e2e' }}
                      >
                        <i className={`${getAmenityIcon(amenity)} text-base`}></i>
                        <span>{amenityName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ МОБИЛЬНАЯ ВЕРСИЯ (вертикальная) ============ */}
        <div className="flex md:hidden flex-col gap-4">
          {/* 1. Название */}
          <h2 className="font-extrabold text-xl text-white">
            {roomName}
          </h2>

          {/* 2. Цена */}
          <p className="font-medium text-base text-white">
            от {roomPrice}₽
          </p>

          {/* 3. Изображение */}
          <div className="w-full bg-[#2E2D2D] rounded-2xl overflow-hidden p-3">
            <div className="relative w-full h-[200px] sm:h-[250px] rounded-xl overflow-hidden bg-[#1f1f1f]">
              {photos.length > 0 ? (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  className="h-full"
                >
                  {photos.map((photo, index) => (
                    <SwiperSlide key={index}>
                      <Image
                        src={getCardPhotoUrl(photo)}
                        alt={`Фото номера: ${roomName} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Нет фото
                </div>
              )}
            </div>
          </div>

          {/* 4. Кнопка Подробнее */}
          <Link href={`/room-types/${room.id}?${params.toString()}`} className="w-full">
            <button className="w-full bg-[#1E1E1E] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3A3A3A] transition">
              Подробнее
            </button>
          </Link>

          {/* 5. Преимущества */}
          <div className="w-full bg-[#2E2D2D] border-2 border-[#333433] p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-start font-bold text-lg text-white">{shortTitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-white mb-4">
              {room.amenities?.map((amenity, idx) => {
                const amenityName = typeof amenity === 'string' ? amenity : amenity?.name || 'Преимущество';
                return (
                  <div
                    key={idx}
                    className="border border-[#FFB200] text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5"
                    style={{ borderColor: '#c59e2e' }}
                  >
                    <i className={`${getAmenityIcon(amenity)} text-sm`}></i>
                    <span>{amenityName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Кнопка Забронировать */}
          <Link href={`/booking?roomId=${room.id}&check_in=${checkIn || ''}&check_out=${checkOut || ''}&guests=${guests}`} className="w-full">
            <button className="w-full bg-[#1E1E1E] rounded-xl text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 transition duration-200">
              Забронировать
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
