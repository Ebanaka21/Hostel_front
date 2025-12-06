// src/components/RoomCard.tsx
import Link from "next/link";


type RoomType = {
  id: string | number; // Убеждаемся, что тип совпадает с RoomType в api.ts
  type_name: string;
  slug: string;
  cheapest_price: number | string;
  capacity: number;
  available_count: number;
  photos?: string[] | null;
  amenities?: string[] | null;
  description?: string | null;
};

interface RoomCardProps {
  room: RoomType;
  checkIn?: string; // Убрал null, так как данные приходят из useState ("")
  checkOut?: string; // Убрал null
  guests?: number; // Убрал null
}

const API_URL = "http://127.0.0.1:8000"; // Проверьте свой API_URL
const PLACEHOLDER =
  "https://via.placeholder.com/800x600/4f46e5/ffffff?text=HostelStay";

// Функция для формирования URL изображения
const getPhotoUrl = (path: string): string => {
  if (!path) return PLACEHOLDER;

  const clean = path.replace(/^\/+/g, "");

  if (clean.includes("rooms/") || clean.includes("storage/")) {
    return `${API_URL}/${
      clean.startsWith("storage/") ? clean : "storage/" + clean
    }`;
  }

  return `${API_URL}/storage/rooms/${clean}`;
};

export default function RoomCard({
  room,
  checkIn,
  checkOut,
  guests,
}: RoomCardProps) {
  // Добавляем проверку, что ID существует и является валидным
  if (!room || room.available_count <= 0 || !room.id) return null; //

  const price = Number(room.cheapest_price) || 0;
  const photoArray = Array.isArray(room.photos) ? room.photos : [];
  const amenitiesList = Array.isArray(room.amenities) ? room.amenities : [];

  // ФОРМИРОВАНИЕ URL (КЛЮЧЕВОЕ ИЗМЕНЕНИЕ ДЛЯ ПЕРЕНАПРАВЛЕНИЯ НА 2-й ЭТАП)
  const bookingUrlParams = new URLSearchParams();

  // Всегда передаем ID номера
  bookingUrlParams.append("roomId", room.id.toString());
  
  // Добавляем даты если они предоставлены
  if (checkIn) {
    bookingUrlParams.append("checkIn", checkIn);
  }
  if (checkOut) {
    bookingUrlParams.append("checkOut", checkOut);
  }
  if (guests && guests > 0) {
    bookingUrlParams.append("guests", guests.toString());
  }
  
  const bookingUrl = `/booking?${bookingUrlParams.toString()}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="relative h-64">
        <img
          src={getPhotoUrl(photoArray.length > 0 ? photoArray[0] : "")}
          alt={room.type_name}
          className="w-full h-full object-cover"
        />
        {room.available_count && (
          <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
            Осталось: {room.available_count}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-gray-800">
          {room.type_name || "Номер без названия"}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {room.description || "Уютный и современный номер в центре города"}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {amenitiesList.slice(0, 6).map((a, i) => (
            <span
              key={i}
              className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
            >
              {a}
            </span>
          ))}
          {amenitiesList.length > 6 && (
            <span className="text-xs text-gray-500">
              +{amenitiesList.length - 6}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-indigo-600">
              от {price.toLocaleString("ru-RU")} ₽
            </span>
            <span className="text-gray-500 block text-sm">за ночь</span>
          </div>

          <Link
            href={bookingUrl} // <-- ИСПОЛЬЗУЕМ ССЫЛКУ С ПАРАМЕТРАМИ
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Забронировать
          </Link>
        </div>
      </div>
    </div>
  );
}