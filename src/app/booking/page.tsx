// app/booking/page.tsx — главная точка входа
'use client';
import { useState, useEffect, Suspense } from 'react'; // <-- ДОБАВЛЕН useEffect
import { useSearchParams } from 'next/navigation'; // <-- ДОБАВЛЕН useSearchParams
import { roomTypes } from '../../lib/api';
import { RoomType, BookingData } from '../../types/room';
// Импорт шагов
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';

function BookingFlowContent() {
  const searchParams = useSearchParams();
  // 1. Чтение параметров из URL
  const urlRoomId = searchParams.get('roomId');
  const urlCheckIn = searchParams.get('check_in') || '';
  const urlCheckOut = searchParams.get('check_out') || '';
  const urlGuests = Number(searchParams.get('guests')) || 1;

  // Преобразуем roomId в число, если это возможно
  const roomIdNumber = urlRoomId ? Number(urlRoomId) : null;

  // 2. Определение начального шага: Если есть ID номера и даты -> Шаг 3 (данные гостя)
  // Начальный шаг будет установлен после загрузки комнаты
  const [step, setStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(step);
  const [loading, setLoading] = useState(!!roomIdNumber); // Если есть roomId, сразу показываем загрузку
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'out' | 'in' | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    room: null,
    // Инициализация состояния данными из URL
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    guests: urlGuests,
    totalPrice: 0,
    guestData: {
      name: '', surname: '', second_name: '',
      birthday: '', phone: '', email: '',
      passport_series: '', passport_number: '',
      passport_issued_at: '', passport_issued_by: '',
      special_requests: '',
    }
  });

  // 3. Загрузка данных комнаты при наличии roomId в URL
  useEffect(() => {
      if (!roomIdNumber) {
          setLoading(false);
          return;
      }

      const fetchRoomDetails = async () => {
          setLoading(true);
          try {
              // Загружаем комнату напрямую по ID (с датами если есть)
              const response = await roomTypes.getById(roomIdNumber);

              if (response.data) {
                  setBookingData(prev => ({
                      ...prev,
                      room: response.data,
                      checkIn: urlCheckIn || prev.checkIn,
                      checkOut: urlCheckOut || prev.checkOut,
                      guests: urlGuests || prev.guests,
                  }));

                  // Рассчитываем цену, если даты есть
                  if (urlCheckIn && urlCheckOut) {
                      const ci = new Date(urlCheckIn);
                      const co = new Date(urlCheckOut);
                      if (co > ci) {
                          const nights = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
                          const price = nights * Number(response.data.cheapest_price || 0);
                          setBookingData(prev => ({
                              ...prev,
                              totalPrice: price
                          }));
                      }
                  }

                  // Устанавливаем флаг, что комната загружена
                  setRoomLoaded(true);
              } else {
                  // Если комната не найдена, возвращаемся на Шаг 1
                  console.warn(`Комната с ID ${roomIdNumber} не найдена. Возврат на Шаг 1.`);
                  setStep(1);
                  setRoomLoaded(true);
              }
          } catch (err) {
              console.error("Ошибка при загрузке данных комнаты:", err);
              setStep(1);
          } finally {
              setLoading(false);
          }
      };
      fetchRoomDetails();
  }, [roomIdNumber]); // Запускаем только при изменении roomId

  // Устанавливаем правильный шаг после загрузки комнаты
  useEffect(() => {
    if (roomLoaded && step === 1) {
      // Устанавливаем шаг только если пользователь еще не перешел на другой шаг
      if (roomIdNumber && urlCheckIn && urlCheckOut) {
        setStep(3);
      } else if (roomIdNumber) {
        setStep(2);
      }
    }
  }, [roomLoaded, roomIdNumber, urlCheckIn, urlCheckOut, step]);

  const nextStep = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationPhase('out');
    setPreviousStep(step);

    // Сначала уводим текущий контент
    setTimeout(() => {
      setStep(prev => prev + 1);
      setAnimationPhase('in');

      // Потом приводим новый контент
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationPhase(null);
      }, 500);
    }, 250);
  };

  const prevStep = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationPhase('out');
    setPreviousStep(step);

    // Сначала уводим текущий контент
    setTimeout(() => {
      setStep(prev => prev - 1);
      setAnimationPhase('in');

      // Потом приводим новый контент
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationPhase(null);
      }, 500);
    }, 250);
  };
  // Определяем направление анимации
  const getAnimationDirection = () => {
    if (step > previousStep) {
      return 'left'; // переход вперед
    } else if (step < previousStep) {
      return 'right'; // переход назад
    }
    return '';
  };
  const animationDirection = getAnimationDirection();
  // Индикатор загрузки
  if (loading && !roomLoaded) {
     return (
        <div className="min-h-screen text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <span className="ml-4 text-xl">Загрузка данных бронирования...</span>
        </div>
      );
    }

  return (
    <div className="min-h-screen text-white py-10 overflow-x-hidden">
      {/* Адаптивный прогресс-бар */}
      <div className="container mx-auto px-4 mb-10">
        {/* Круги и линии */}
        <div className="flex justify-center items-center overflow-x-auto pb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold transition-all duration-300
                  ${step >= n ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}>
                  {n}
                </div>
                {n < 4 && (
                  <div className={`w-8 sm:w-16 md:w-20 lg:w-32 h-1 mx-1 sm:mx-2 transition-all duration-300 ${step > n ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Подписи этапов */}
        <div className="flex justify-center mt-4 overflow-x-auto">
          <div className="flex items-center gap-4 sm:gap-8 md:gap-12 lg:gap-20">
            <span className={`text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${step === 1 ? 'text-yellow-400' : 'text-gray-400'}`}>Выбор номера</span>
            <span className={`text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${step === 2 ? 'text-yellow-400' : 'text-gray-400'}`}>Даты и гости</span>
            <span className={`text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${step === 3 ? 'text-yellow-400' : 'text-gray-400'}`}>Данные гостя</span>
            <span className={`text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${step === 4 ? 'text-yellow-400' : 'text-gray-400'}`}>Подтверждение</span>
          </div>
        </div>
      </div>
      {/* Контейнер с анимацией свайпа */}
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden">
          {/* Рендеринг шагов с двухэтапной анимацией */}
          {animationPhase === 'out' ? (
            <div className={`transition-all duration-500 ease-in-out ${
              animationDirection === 'left' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
            }`}>
              {previousStep === 1 && <Step1 data={bookingData} setData={setBookingData} next={nextStep} />}
              {previousStep === 2 && <Step2 data={bookingData} setData={setBookingData} next={nextStep} prev={prevStep} />}
              {previousStep === 3 && <Step3 data={bookingData} setData={setBookingData} next={nextStep} prev={prevStep} />}
              {previousStep === 4 && <Step4 data={bookingData} prev={prevStep} />}
            </div>
          ) : (
            <div className={`transition-all duration-500 ease-in-out ${
              animationPhase === 'in' ? (
                animationDirection === 'left' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'
              ) : 'translate-x-0 opacity-100'
            }`}>
              {step === 1 && <Step1 data={bookingData} setData={setBookingData} next={nextStep} />}
              {step === 2 && <Step2 data={bookingData} setData={setBookingData} next={nextStep} prev={prevStep} />}
              {step === 3 && <Step3 data={bookingData} setData={setBookingData} next={nextStep} prev={prevStep} />}
              {step === 4 && <Step4 data={bookingData} prev={prevStep} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <span className="ml-4 text-xl">Загрузка...</span>
      </div>
    }>
      <BookingFlowContent />
    </Suspense>
  );
}