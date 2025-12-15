// app/booking/steps/Step2.tsx
"use client";

import React, { useEffect } from "react";
import { BookingData } from "../../../types/room";

interface Step2Props {
  data: BookingData;
  setData: (updater: (prev: BookingData) => BookingData) => void;
  next: () => void;
  prev: () => void;
}

const getPhotoUrl = (photos: string[] | null | undefined): string => {
  const arr = Array.isArray(photos) ? photos : [];
  return arr.length > 0 ? arr[0] : "/placeholder.svg";
};

export default function Step2({ data, setData, next, prev }: Step2Props) {
  // Пересчёт цены
  useEffect(() => {
    if (!data.checkIn || !data.checkOut || !data.room) {
      setData((p: BookingData) => ({ ...p, totalPrice: 0 }));
      return;
    }
    const ci = new Date(data.checkIn);
    const co = new Date(data.checkOut);
    if (co <= ci) {
      setData((p: BookingData) => ({ ...p, totalPrice: 0 }));
      return;
    }
    const nights = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    const total = nights * Number(data.room?.cheapest_price || 0);
    setData((p: BookingData) => ({ ...p, totalPrice: total }));
  }, [data.checkIn, data.checkOut, data.room, setData]);

  const formatDate = (s?: string) => {
    if (!s) return "";
    const d = new Date(s);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  };

  const getNights = () => {
    if (!data.checkIn || !data.checkOut) return 0;
    const ci = new Date(data.checkIn);
    const co = new Date(data.checkOut);
    const diff = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const pricePerNight = Number(data.room?.cheapest_price || 0);
  const nights = getNights();
  const subtotal = nights * pricePerNight;
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;

  return (
    <div className="bg-[#272727] rounded-xl p-6 text-start">
      <h2 className="text-3xl font-bold mb-8 text-center">Даты и количество гостей</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Левая — форма выбора дат и сводка цены */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Дата заезда</label>
              <input
                type="date"
                id="checkin-date"
                value={data.checkIn || ""}
                onChange={(e) => setData((p: BookingData) => ({ ...p, checkIn: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Дата выезда</label>
              <input
                type="date"
                id="checkout-date"
                value={data.checkOut || ""}
                onChange={(e) => setData((p: BookingData) => ({ ...p, checkOut: e.target.value }))}
                min={
                  data.checkIn
                    ? (() => {
                        const d = new Date(data.checkIn);
                        d.setDate(d.getDate() + 1);
                        return d.toISOString().split("T")[0];
                      })()
                    : new Date().toISOString().split("T")[0]
                }
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Количество гостей</label>
            <select
              id="guests-count"
              value={data.guests || 1}
              onChange={(e) => setData((p: BookingData) => ({ ...p, guests: Number(e.target.value) }))}
              className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="1">1 гость</option>
              <option value="2">2 гостя</option>
              <option value="3">3 гостя</option>
              <option value="4">4 гостя</option>
            </select>
          </div>

          {/* Сводка стоимости */}
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <h3 className="font-semibold mb-3">Сводка стоимости</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span id="selected-room-name">{data.room?.type_name || "Номер не выбран"}</span>
                <span id="price-per-night">{pricePerNight.toLocaleString("ru-RU")}₽</span>
              </div>
              <div className="flex justify-between">
                <span id="nights-count">{nights} {nights === 1 ? "ночь" : nights > 1 ? "ночи" : "ночей"}</span>
                <span id="subtotal">{subtotal.toLocaleString("ru-RU")}₽</span>
              </div>
              <div className="flex justify-between">
                <span>Налог (10%)</span>
                <span id="tax">{tax.toLocaleString("ru-RU")}₽</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Итого:</span>
                  <span id="total-price" className="text-[#FFB200]">{total.toLocaleString("ru-RU")}₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Правая — резюме выбранного номера */}
        <div className="bg-[#1E1E1E] rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Выбранный номер</h3>
          <div id="room-summary">
            {!data.room ? (
              <p className="text-gray-400">Пожалуйста, выберите номер на предыдущем шаге</p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="w-28 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <img src={getPhotoUrl(data.room?.photos)} alt={data.room?.type_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{data.room.type_name}</p>
                    <p className="text-sm text-gray-300">Вместимость: {data.room.capacity} гостей</p>
                    <p className="text-sm text-gray-300">Цена за ночь: {data.room.cheapest_price.toLocaleString("ru-RU")}₽</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8">
        <button onClick={prev} className="bg-[#1E1E1E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition order-2 sm:order-1 text-sm sm:text-base">
          ← Назад
        </button>

        <button
          onClick={next}
          disabled={!data.checkIn || !data.checkOut || total === 0}
          className="bg-[#FFB200] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#FFB200]/90 transition order-1 sm:order-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Далее →
        </button>
      </div>
    </div>
  );
}
