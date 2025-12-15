
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { bookings } from "../../../lib/api"; // твоя обёртка API
import { BookingData } from "../../../types/room";

interface Step4Props {
  data: BookingData;
  prev: () => void;
}

export default function Step4({ data, prev }: Step4Props) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = React.useState("card");
  const [agree, setAgree] = React.useState(false);
  const [newsletter, setNewsletter] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!agree) {
      alert("Нужно согласиться с условиями бронирования");
      return;
    }
    
    // Валидация данных перед отправкой
    if (!data.guestData?.name) {
      alert("Пожалуйста, укажите имя гостя");
      return;
    }
    if (!data.guestData?.surname) {
      alert("Пожалуйста, укажите фамилию гостя");
      return;
    }
    if (!data.guestData?.phone) {
      alert("Пожалуйста, укажите телефон гостя");
      return;
    }
    if (!data.guestData?.passport_series) {
      alert("Пожалуйста, укажите серию паспорта");
      return;
    }
    if (!data.guestData?.passport_number) {
      alert("Пожалуйста, укажите номер паспорта");
      return;
    }
    if (!data.guestData?.passport_issued_at) {
      alert("Пожалуйста, укажите дату выдачи паспорта");
      return;
    }
    if (!data.guestData?.passport_issued_by) {
      alert("Пожалуйста, укажите кем выдан паспорт");
      return;
    }
    
    setLoading(true);
    try {
      // Форматируем даты в Y-m-d формат
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      const payload = {
        room_id: data.room?.id || 0,
        check_in_date: formatDate(data.checkIn),
        check_out_date: formatDate(data.checkOut),
        guest_name: data.guestData.name,
        guest_surname: data.guestData.surname,
        guest_second_name: data.guestData.second_name || '',
        guest_birthday: formatDate(data.guestData.birthday || ''),
        guest_phone: data.guestData.phone,
        // Не отправляем guest_email, так как оно еще не добавлено в базу данных
        guest_passport_series: data.guestData.passport_series,
        guest_passport_number: data.guestData.passport_number,
        guest_passport_issued_at: formatDate(data.guestData.passport_issued_at),
        guest_passport_issued_by: data.guestData.passport_issued_by,
        special_requests: data.guestData.special_requests || '',
      };
      console.log('Payload dates:', {
        check_in_date: payload.check_in_date,
        check_out_date: payload.check_out_date,
        guest_birthday: payload.guest_birthday,
        guest_passport_issued_at: payload.guest_passport_issued_at
      });
      console.log('Sending payload:', payload);
      const res = await bookings.create(payload);
      if (res?.data?.id) {
        router.push("/profile");
      } else {
        alert("Не удалось подтвердить бронирование");
      }
    } catch (err) {
      console.error(err);
      const errorResponse = (err as { response?: { data?: Record<string, unknown> } }).response?.data;
      const errorMessage = errorResponse?.error || errorResponse?.message || errorResponse?.details || "Ошибка при бронировании";
      const fullError = JSON.stringify(errorResponse, null, 2);
      alert(`Ошибка: ${errorMessage}\n\nПолная информация: ${fullError}`);
      console.error('Full error:', errorResponse);
      console.error('Error stack:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#272727] rounded-xl p-6 text-start">
      <h2 className="text-2xl font-bold mb-6">Подтверждение бронирования</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        <div className="space-y-6">
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Сводка бронирования</h3>
            <div id="confirmation-summary" className="space-y-3 text-sm text-gray-300">
              <div>Номер: {data?.room?.type_name || "—"}</div>
              <div>Заезд: {data?.checkIn || "—"}</div>
              <div>Выезд: {data?.checkOut || "—"}</div>
              <div>Гостей: {data?.guests || 1}</div>
              <div>Итого: {(data?.totalPrice || 0).toLocaleString("ru-RU")}₽</div>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Информация о госте</h3>
            <div id="confirmation-guest" className="space-y-2 text-sm text-gray-300">
              <div>{data?.guestData?.name} {data?.guestData?.surname}</div>
              <div>Телефон: {data?.guestData?.phone || "-"}</div>
              <div>Email: {data?.guestData?.email || "-"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Способ оплаты</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 focus:ring-[#FFB200]" />
                <span>Банковской картой</span>
              </label>

              <label className="flex items-center">
                <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 focus:ring-[#FFB200]" />
                <span>Наличными при заезде</span>
              </label>

              <label className="flex items-center">
                <input type="radio" name="payment" value="transfer" checked={paymentMethod === "transfer"} onChange={() => setPaymentMethod("transfer")} className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 focus:ring-[#FFB200]" />
                <span>Банковский перевод</span>
              </label>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Условия бронирования</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <label className="flex items-start">
                <input type="checkbox" id="terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mr-3 mt-1 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]" />
                <span>Я согласен с <a href="#" className="text-[#FFB200] hover:underline">условиями бронирования</a> и <a href="#" className="text-[#FFB200] hover:underline">политикой конфиденциальности</a></span>
              </label>

              <label className="flex items-start">
                <input type="checkbox" id="newsletter" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mr-3 mt-1 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]" />
                <span>Я хочу получать информацию о специальных предложениях и новостях</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8">
        <button onClick={prev} className="bg-[#1E1E1E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition">← Назад</button>
        <button onClick={handleConfirm} className="bg-[#FFB200] text-black px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#FFB200]/90 transition">
          {loading ? "Подождите..." : "Подтвердить бронирование"}
        </button>
      </div>
    </div>
  );
}
