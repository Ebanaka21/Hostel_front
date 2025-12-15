// app/booking/steps/Step3.tsx
"use client";

import React, { useEffect } from "react";
import { auth } from "../../../lib/api"; // используй свою api-обёртку
import { BookingData } from "../../../types/room";

interface Step3Props {
  data: BookingData;
  setData: (updater: (prev: BookingData) => BookingData) => void;
  next: () => void;
  prev: () => void;
}

export default function Step3({ data, setData, next, prev }: Step3Props) {
  // Автозаполнение профиля
  useEffect(() => {
    const load = async () => {
      try {
        const res = await auth.getUser();
        const user = res.data || {};
        setData((p: BookingData) => ({
          ...p,
          guestData: {
            name: user.name || p.guestData?.name || "",
            surname: user.surname || p.guestData?.surname || "",
            second_name: user.second_name || p.guestData?.second_name || "",
            birthday: user.birthday || p.guestData?.birthday || "",
            phone: user.phone || p.guestData?.phone || "",
            email: user.email || p.guestData?.email || "",
            passport_series: user.passport_series || p.guestData?.passport_series || "",
            passport_number: user.passport_number || p.guestData?.passport_number || "",
            passport_issued_at: user.passport_issued_at || p.guestData?.passport_issued_at || "",
            passport_issued_by: user.passport_issued_by || p.guestData?.passport_issued_by || "",
            special_requests: user.special_requests || p.guestData?.special_requests || ""
          }
        }));
      } catch (err) {
        // если не авторизован — ок
        console.log("Профиль не загружен");
      }
    };
    load();
  }, []);

  const handleChange = (field: string, value: string) => {
    setData((p: BookingData) => ({
      ...p,
      guestData: {
        ...(p.guestData || {}),
        [field]: value
      }
    }));
  };

  const isValid = () => {
    const g = data.guestData || {};
    return !!(g.name && g.surname && g.phone && g.passport_series && g.passport_number);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  };
  
  const formatDateForAPI = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-[#272727] rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Данные гостя</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Имя *</label>
            <input value={data.guestData?.name || ""} onChange={(e) => handleChange("name", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Фамилия *</label>
            <input value={data.guestData?.surname || ""} onChange={(e) => handleChange("surname", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Отчество</label>
            <input value={data.guestData?.second_name || ""} onChange={(e) => handleChange("second_name", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Дата рождения *</label>
            <input type="date" value={data.guestData?.birthday || ""} onChange={(e) => handleChange("birthday", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Телефон *</label>
            <input type="tel" value={data.guestData?.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+7 (___) ___-__-__" className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={data.guestData?.email || ""} onChange={(e) => handleChange("email", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
          </div>
        </div>

        <div className="border-t border-gray-600 pt-6">
          <h3 className="text-lg font-semibold mb-4">Паспортные данные</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Серия паспорта *</label>
              <input maxLength={4} value={data.guestData?.passport_series || ""} onChange={(e) => handleChange("passport_series", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" placeholder="1234" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Номер паспорта *</label>
              <input maxLength={6} value={data.guestData?.passport_number || ""} onChange={(e) => handleChange("passport_number", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" placeholder="567890" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Дата выдачи *</label>
              <input type="date" value={data.guestData?.passport_issued_at || ""} onChange={(e) => handleChange("passport_issued_at", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Кем выдан *</label>
              <input value={data.guestData?.passport_issued_by || ""} onChange={(e) => handleChange("passport_issued_by", e.target.value)} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Особые пожелания</label>
          <textarea value={data.guestData?.special_requests || ""} onChange={(e) => handleChange("special_requests", e.target.value)} rows={4} className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white" placeholder="Дополнительные требования или пожелания..." />
        </div>
        
        {/* Booking summary */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-3">Ваше бронирование</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Номер:</span>
              <span className="font-medium">{data.room?.type_name || "Номер не выбран"}</span>
            </div>
            <div className="flex justify-between">
              <span>Дата заезда:</span>
              <span>{formatDate(data.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span>Дата выезда:</span>
              <span>{formatDate(data.checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span>Количество гостей:</span>
              <span>{data.guests || 1} {data.guests === 1 ? 'гость' : 'гостя'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-600">
              <span>Стоимость:</span>
              <span className="text-[#FFB200]">{data.totalPrice.toLocaleString("ru-RU")}₽</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8">
        <button onClick={prev} className="bg-[#1E1E1E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition">← Назад</button>
        <button onClick={next} disabled={!isValid()} className="bg-[#FFB200] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#FFB200]/90 transition disabled:opacity-50">Далее →</button>
      </div>
    </div>
  );
}
