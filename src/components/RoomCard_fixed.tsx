import Link from 'next/link';
import Image from 'next/image';
import { RoomType, AmenityType } from '../lib/api';

const API_BASE_URL = "http://127.0.0.1:8000";

// Полный URL к фото
const getCardPhotoUrl = (path: string | undefined): string => {
  
  // Удаляем все префиксы /storage/, /rooms/ для чистого пути
  const cleanPath = path
    .replace(/^\/storage\//, '')
    .replace(/^rooms\//, '')
    .replace(/^\/+/, ''); // убираем слеш в начале
  
  // Создаем правильный URL с кодированием для кириллицы
  const encoded = encodeURIComponent(cleanPath);
  return `${API_BASE_URL}/storage/${encoded}`;
};

// Иконки удобств - только из базы данных
const getAmenityIcon = (amenity: string | AmenityType) => {
  // Если это объект AmenityType с icon_class, используем его
  if (typeof amenity === 'object' && amenity?.icon_class) {
    return amenity.icon_class;
  }
  
  // Если это строка, fallback на звездочку
  return 'bx bx-star';
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

  const photoUrl = getCardPhotoUrl(room.photos?.[0]);
  const shortTitle = (room.type_name || roomName).slice(0, 2).toUpperCase();

  // Защита от некорректных данных
  if (!roomName || roomPrice === undefined) {
    console.warn("RoomCard: Missing critical data", room);
    return null;
  }

  return (
    <section className="container mx-auto py-4 border-b-2 border-[#FFB200]">
      <div className="w-full bg-[#4A4949] border border-[#3A3A3A] rounded-lg md:p-6 flex  md:flex-row gap-6 hover:shadow-lg transition-shadow duration-300">
        {/* LEFT: IMAGE + BUTTON */}
        <div className="w-full max-w-[520px] grid gap-4">
          {/* Внешняя рамка (темный фон + скругление) */}
          <div className="w-full bg-[#2E2D2D] rounded-2xl overflow-hidden p-4">
            {/* Контейнер изображения: фиксированная высота, скругление */}
            <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-[#1f1f1f]">
              <Image
                src={photoUrl}
                alt={`Фото номера: ${roomName}`}
                fill
                className="object-cover"
                onError={(e) => {
                  console.warn('Failed to load image:', photoUrl);
                }}
              />

              {/* Точки-слайдер (поверх изображения) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
