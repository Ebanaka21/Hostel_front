"use client";

import { useState } from "react";
import { auth } from "../../lib/api";
import ProfileBookings from "@/components/ProfileBookings";

interface Booking {
  id: number;
  period: string;
  roomType: string;
  status: string;
  total: number;
}

const mockBookings: Booking[] = [
  {
    id: 1,
    period: "2023-12-01 - 2023-12-05",
    roomType: "Стандарт",
    status: "Ожидает оплаты",
    total: 5000,
  },
  {
    id: 2,
    period: "2023-11-15 - 2023-11-20",
    roomType: "Люкс",
    status: "Оплачено",
    total: 10000,
  },
  {
    id: 3,
    period: "2023-10-10 - 2023-10-15",
    roomType: "Эконом",
    status: "Подтверждено",
    total: 3000,
  },
  {
    id: 4,
    period: "2023-09-05 - 2023-09-10",
    roomType: "Стандарт",
    status: "Отменено",
    total: 4500,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [bookingTab, setBookingTab] = useState("active");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ожидает оплаты":
        return "bg-purple-600 text-purple-100";
      case "Оплачено":
        return "bg-green-600 text-green-100";
      case "Подтверждено":
        return "bg-blue-600 text-blue-100";
      case "Отменено":
        return "bg-red-600 text-red-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancel = (id: number) => {
    alert(`Отменить бронирование ${id}`);
  };

  const handlePay = (id: number) => {
    alert(`Оплатить бронирование ${id}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Профиль</h2>
            <p>Здесь будет информация о профиле пользователя.</p>
          </div>
        );
      case "bookings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Мои бронирования</h2>

            {/* Вкладки: Активные / Все */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => setBookingTab("active")}
                className={`pb-2 px-1 ${
                  bookingTab === "active"
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-gray-400"
                }`}
              >
                Активные
              </button>
              <button
                onClick={() => setBookingTab("all")}
                className={`pb-2 px-1 ${
                  bookingTab === "all"
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-gray-400"
                }`}
              >
                Все
              </button>
            </div>

            {/* Здесь подключаем живые брони с бэкенда */}
            <ProfileBookings activeTab={bookingTab} />
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Настройки</h2>
            <p>Здесь будут настройки аккаунта.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800">
        <div className="p-4">
          <h1 className="text-xl font-bold">Личный кабинет</h1>
        </div>
        <nav className="flex-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left p-4 hover:bg-gray-700 ${
              activeTab === "profile" ? "bg-gray-700" : ""
            }`}
          >
            Профиль
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full text-left p-4 hover:bg-gray-700 ${
              activeTab === "bookings" ? "bg-gray-700" : ""
            }`}
          >
            Мои брони
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left p-4 hover:bg-gray-700 ${
              activeTab === "settings" ? "bg-gray-700" : ""
            }`}
          >
            Настройки
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left p-4 hover:bg-red-700 text-red-400"
          >
            Выйти
          </button>
        </nav>
      </div>

      {/* Mobile Top Nav */}
      <div className="md:hidden w-full bg-gray-800 p-4">
        <nav className="flex justify-around">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded ${
              activeTab === "profile" ? "bg-gray-700" : ""
            }`}
          >
            Профиль
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded ${
              activeTab === "bookings" ? "bg-gray-700" : ""
            }`}
          >
            Мои брони
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded ${
              activeTab === "settings" ? "bg-gray-700" : ""
            }`}
          >
            Настройки
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded text-red-400 hover:bg-red-700"
          >
            Выйти
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">{renderTabContent()}</div>

      {/* Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Детали бронирования</h3>
            <p>
              <strong>ID:</strong> {selectedBooking.id}
            </p>
            <p>
              <strong>Период:</strong> {selectedBooking.period}
            </p>
            <p>
              <strong>Тип номера:</strong> {selectedBooking.roomType}
            </p>
            <p>
              <strong>Статус:</strong> {selectedBooking.status}
            </p>
            <p>
              <strong>Сумма:</strong> {selectedBooking.total}₽
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
