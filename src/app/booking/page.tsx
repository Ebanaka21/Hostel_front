// app/booking/page.tsx — главная точка входа
'use client';

import { useState, useEffect } from 'react'; // <-- ДОБАВЛЕН useEffect
import { useSearchParams } from 'next/navigation'; // <-- ДОБАВЛЕН useSearchParams
import { roomTypes } from '../../lib/api'; 
import { RoomType, BookingData } from '../../types/room'; 

// Импорт шагов
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';

export default function BookingFlow() {
  const searchParams = useSearchParams();

  // 1. Чтение параметров из URL
  const urlRoomId = searchParams.get('roomId');
  const urlCheckIn = searchParams.get('checkIn') || '';
  const urlCheckOut = searchParams.get('checkOut') || '';
  const urlGuests = Number(searchParams.get('guests')) || 1;
  
  // 2. Определение начального шага: Если есть ID номера -> Шаг 2 (выбор дат)
  const [step, setStep] = useState(urlRoomId ? 2 : 1);
  const [loading, setLoading] = useState(!!urlRoomId); // Если есть roomId, сразу показываем загрузку
  const [bookingData, setBookingData] = useState<BookingData>({
    room: null,
    // Инициализация состояния данными из URL
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    guests: urlGuests,
    totalPrice: 0,
    guestData: {
      name: '', surname: '', second_name: '',
      birthday: '', phone: '',
      passport_series: '', passport_number: '',
      passport_issued_at: '', passport_issued_by: '',
    }
  });
  
  // 3. Загрузка данных комнаты при наличии roomId в URL
  useEffect(() => {
      if (!urlRoomId) {
          setLoading(false);
          return;
      }
      
      const fetchRoomDetails = async () => {
          setLoading(true);
          try {
              // Загружаем комнату напрямую по ID (с датами если есть)
              const response = await roomTypes.getById(urlRoomId, urlCheckIn, urlCheckOut);
              
              if (response.data) {
                  setBookingData(prev => ({ 
                      ...prev, 
                      room: response.data,
                      checkIn: urlCheckIn || prev.checkIn,
                      checkOut: urlCheckOut || prev.checkOut,
                      guests: urlGuests || prev.guests,
                  }));
                  setStep(2); // Устанавливаем шаг 2 после успешной загрузки
              } else {
                  // Если комната не найдена, возвращаемся на Шаг 1 
                  console.warn(`Комната с ID ${urlRoomId} не найдена. Возврат на Шаг 1.`);
                  setStep(1);
              }

          } catch (err) {
              console.error("Ошибка при загрузке данных комнаты:", err);
              setStep(1); 
          } finally {
              setLoading(false);
          }
      };

      fetchRoomDetails();
  }, [urlRoomId]); // Запускаем только при изменении roomId 

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Индикатор загрузки
  if (loading) {
     return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <span className="ml-4 text-xl">Загрузка данных бронирования...</span>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      {/* Прогресс-бар */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex justify-center items-center gap-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all
                ${step >= n ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}>
                {n}
              </div>
              {n < 4 && (
                <div className={`w-32 h-1 ${step > n ? 'bg-yellow-500' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-20 mt-4 text-sm">
          <span className={step === 1 ? 'text-yellow-400' : ''}>Выбор номера</span>
          <span className={step === 2 ? 'text-yellow-400' : ''}>Даты и гости</span>
          <span className={step === 3 ? 'text-yellow-400' : ''}>Данные гостя</span>
          <span className={step === 4 ? 'text-yellow-400' : ''}>Подтверждение</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Рендеринг шагов */}
        {step === 1 && <Step1 data={bookingData} setData={setBookingData} next={nextStep} />}
        {step === 2 && <Step2 data={bookingData} setData={setBookingData} next={nextStep} prev={prevStep} />}
        {step === 3 && <Step3 data={bookingData} setData={setBookingData} next={nextStep} prev={prevStep} />}
        {step === 4 && <Step4 data={bookingData} prev={prevStep} />}
      </div>
    </div>
  );
}