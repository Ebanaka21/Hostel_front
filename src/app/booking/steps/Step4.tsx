'use client';

import { useRouter } from 'next/navigation';
import { bookings } from '../../../lib/api';

export default function Step4({ data, prev }) {
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      console.log('Starting booking creation...');
      console.log('Booking data:', data);

      // Отправляем бронирование
      const payload = {
        room_id: Number(data.room.id),
        check_in_date: data.checkIn,
        check_out_date: data.checkOut,
        total_price: data.totalPrice,
        guest_data: data.guestData, // можно сохранить в отдельную таблицу потом
      };

      console.log('Payload to send:', payload);

      const response = await bookings.create(payload);
      console.log('Booking created successfully:', response.data);

      alert('Бронь успешно создана! Переход в профиль...');
      router.push('/profile');
    } catch (err: any) {
      console.error('Booking creation failed:', err);
      console.error('Error response:', err.response?.data);
      alert('Ошибка: ' + (err.response?.data?.error || err.response?.data?.message || 'Попробуйте позже'));
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Подтверждение бронирования</h2>

      <div className="space-y-6 text-lg">
        <div className="bg-gray-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-yellow-400">{data.room?.type_name}</h3>
          <p className="text-gray-400">от {data.room?.cheapest_price.toLocaleString()} ₽ / ночь</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <strong>Заезд:</strong> {new Date(data.checkIn).toLocaleDateString('ru-RU')}
          </div>
          <div>
            <strong>Выезд:</strong> {new Date(data.checkOut).toLocaleDateString('ru-RU')}
          </div>
          <div>
            <strong>Гостей:</strong> {data.guests}
          </div>
          <div>
            <strong>Итого к оплате:</strong>{' '}
            <span className="text-3xl font-bold text-yellow-500">
              {data.totalPrice.toLocaleString()} ₽
            </span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h4 className="font-bold mb-3">Гость:</h4>
          <p>{data.guestData.surname} {data.guestData.name} {data.guestData.second_name}</p>
          <p>Паспорт: {data.guestData.passport_series} {data.guestData.passport_number}</p>
          <p>Телефон: {data.guestData.phone}</p>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button onClick={prev} className="px-8 py-4 bg-gray-700 rounded-xl">
          Назад
        </button>
        <button onClick={handleConfirm}
          className="px-16 py-5 bg-yellow-500 text-black text-xl font-bold rounded-xl hover:bg-yellow-400 transition">
          Подтвердить бронирование
        </button>
      </div>
    </div>
  );
}