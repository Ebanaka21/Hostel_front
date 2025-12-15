"use client";

import { useState, useEffect, useRef } from "react";
import { auth, bookings } from "../../lib/api";
import ProfileBookings from "@/components/ProfileBookings";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface Booking {
  id: number;
  period: string;
  roomType: string;
  status: string;
  total: number;
}

interface BookingResponse {
  id: number;
  room: {
    id: number;
    name: string;
    price_per_night: number;
    [key: string]: unknown;
  };
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
}

interface User {
  id: number;
  name: string;
  surname?: string;
  second_name?: string;
  birthday?: string;
  email: string;
  phone?: string;
}

// Удалены заглушки - данные теперь загружаются из API через компонент ProfileBookings

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [bookingTab, setBookingTab] = useState("active");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookingsList, setBookingsList] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    second_name: "",
    birthday: "",
    phone: "",
  });
  
  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartTab = useRef<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Загружаем данные пользователя и бронирования параллельно
        const [userRes, bookingsRes] = await Promise.all([
          auth.getUser(),
          bookings.getAll(),
        ]);
        
        setUser(userRes.data);
        setFormData({
          name: userRes.data.name || "",
          surname: userRes.data.surname || "",
          second_name: userRes.data.second_name || "",
          birthday: userRes.data.birthday || "",
          phone: userRes.data.phone || "",
        });
        
        // Сохраняем бронирования в состоянии
        const bookingsWithRooms = bookingsRes.data.map((b: BookingResponse) => ({
          ...b,
          room: {
            id: b.room.id,
            name: b.room.name || 'Номер',
          },
        }));
        setBookingsList(bookingsWithRooms);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.updateProfile(formData);
      alert("Данные успешно сохранены!");
      // Refresh user data
      const res = await auth.getUser();
      setUser(res.data);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Ошибка при сохранении данных");
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

  const handleCancel = async (id: number) => {
    try {
      setLoading(true);
      await bookings.cancel(id);
      // Обновить список бронирований
      setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (error) {
      alert('Ошибка отмены');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: number) => {
    try {
      setLoading(true);
      await bookings.pay(id);
      // Обновить список бронирований
      setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b));
    } catch (error) {
      alert('Ошибка оплаты');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = (id: number) => {
    if (confirm('Удалить бронирование?')) {
      if (bookingTab === 'active') {
        // Перемещаем из Активных во Все (меняем статус на cancelled)
        setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        alert('Бронирование перемещено во "Все"');
      } else {
        // Удаляем из Всех (отмененные или истекшие)
        setBookingsList(prev => prev.filter(b => b.id !== id));
        alert('Бронирование удалено');
      }
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTab.current = activeTab;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartTab.current === null) return;

    const touchEndX = e.touches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Minimum distance for swipe (50px)
    const minSwipeDistance = 50;

    // Swipe left (to next tab)
    if (diffX > minSwipeDistance) {
      if (touchStartTab.current === "profile") {
        setActiveTab("bookings");
      } else if (touchStartTab.current === "bookings") {
        setActiveTab("settings");
      }
      touchStartX.current = null;
      touchStartTab.current = null;
    }
    // Swipe right (to previous tab)
    else if (diffX < -minSwipeDistance) {
      if (touchStartTab.current === "bookings") {
        setActiveTab("profile");
      } else if (touchStartTab.current === "settings") {
        setActiveTab("bookings");
      }
      touchStartX.current = null;
      touchStartTab.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    touchStartTab.current = null;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="bg-[#272727] rounded-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Личная информация</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Profile Image and Basic Info */}
                <div className="text-center lg:col-span-1">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#FFB200] rounded-full flex items-center justify-center text-black text-2xl sm:text-4xl font-bold mx-auto mb-4">
                    {user && (user.surname ?
                      `${user.name.charAt(0)}${user.surname.charAt(0)}` :
                      user.name ? user.name.charAt(0).repeat(2) : "ИВ")}
                  </div>
                  {user && user.surname && (
                    <h3 className="text-lg font-semibold mt-2">{user.name} {user.surname}</h3>
                  )}
                </div>

               {/* Profile Form */}
               <div className="lg:col-span-2">
                 <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                     <div>
                       <label className="block text-sm font-medium mb-2">Имя</label>
                       <input
                         type="text"
                         name="name"
                         value={formData.name}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium mb-2">Фамилия</label>
                       <input
                         type="text"
                         name="surname"
                         value={formData.surname}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium mb-2">Отчество</label>
                       <input
                         type="text"
                         name="second_name"
                         value={formData.second_name}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium mb-2">Дата рождения</label>
                       <input
                         type="date"
                         name="birthday"
                         value={formData.birthday}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium mb-2">Телефон</label>
                       <input
                         type="tel"
                         name="phone"
                         value={formData.phone}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium mb-2">Email</label>
                       <input
                         type="email"
                         value={user?.email || ""}
                         readOnly
                         className="w-full px-4 py-3 bg-[#1E1E1E] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base cursor-not-allowed"
                       />
                     </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                     <button type="submit" className="bg-[#FFB200] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#FFB200]/90 transition text-sm sm:text-base w-full sm:w-auto">
                       Сохранить изменения
                     </button>
                     <button type="button" className="bg-[#1E1E1E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition text-sm sm:text-base w-full sm:w-auto">
                       Отменить
                     </button>
                   </div>
                 </form>
               </div>
             </div>
            </div>
          </div>
        );
      case "bookings":
        return (
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Мои бронирования</h2>

              {/* Tabs: Активные / Все */}
              <div className="flex gap-4 mb-6 border-b border-[#FFB200]/30">
                <button
                  onClick={() => setBookingTab("active")}
                  className={`pb-2 px-1 border-b-2 text-sm sm:text-base ${
                    bookingTab === "active" ? "border-[#FFB200] text-[#FFB200]" : "text-gray-400"
                  }`}
                >
                  Активные
                </button>
                <button
                  onClick={() => setBookingTab("all")}
                  className={`pb-2 px-1 text-sm sm:text-base ${
                    bookingTab === "all" ? "border-[#FFB200] text-[#FFB200]" : "text-gray-400"
                  }`}
                >
                  Все
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              <ProfileBookings activeTab={bookingTab} bookingsList={bookingsList} loading={loading} onPay={handlePay} onCancel={handleCancel} onDelete={handleDeleteBooking} />
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="bg-[#272727] rounded-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Настройки аккаунта</h2>

              <div className="space-y-8">
                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Уведомления</h3>
                  <div className="space-y-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]"/>
                      <span className="text-sm sm:text-base">Email уведомления о бронированиях</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]"/>
                      <span className="text-sm sm:text-base">SMS уведомления</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]"/>
                      <span className="text-sm sm:text-base">Маркетинговые рассылки</span>
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Приватность</h3>
                  <div className="space-y-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]"/>
                      <span className="text-sm sm:text-base">Сохранять данные бронирования для удобства</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-3 w-5 h-5 text-[#FFB200] bg-[#1E1E1E] border-white/20 rounded focus:ring-[#FFB200]"/>
                      <span className="text-sm sm:text-base">Показывать профиль другим пользователям</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ScrollToTopButton />
      <div className="min-h-screen bg-[#2E2D2D] text-white flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-[#2E2D2D] border-r border-[#FFB200]/30">
        <div className="p-6">
          <h1 className="text-xl font-bold">Личный кабинет</h1>
        </div>
        <nav className="flex-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`tab-button w-full text-left px-6 py-4 hover:bg-[#FFB200] bg-[#2E2D2D] flex items-center ${
              activeTab === "profile" ? "bg-[#FFB200] text-black" : "text-white"
            }`}
          >
            <i className='bx bx-user mr-3 text-lg'></i>
            Профиль
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`tab-button w-full text-left px-6 py-4 hover:bg-[#2E2D2D] flex items-center ${
              activeTab === "bookings" ? "bg-[#FFB200] text-black" : "text-white"
            }`}
          >
            <i className='bx bx-calendar mr-3 text-lg'></i>
            Мои брони
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`tab-button w-full text-left px-6 py-4 hover:bg-[#2E2D2D] flex items-center ${
              activeTab === "settings" ? "bg-[#FFB200] text-black" : "text-white"
            }`}
          >
            <i className='bx bx-cog mr-3 text-lg'></i>
            Настройки
          </button>
        </nav>
      </div>

      {/* Mobile Top Nav */}
      <div className="lg:hidden w-full bg-[#2E2D2D] p-4 border-b border-[#FFB200]/30">
        <nav className="flex justify-around gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`mobile-tab-button flex-1 px-3 py-3 rounded-lg ${
              activeTab === "profile" ? "bg-[#FFB200] text-black" : "text-white"
            }`}
          >
            <i className='bx bx-user mr-2'></i>
            <p>Профиль</p>
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`mobile-tab-button flex-1 px-3 py-3 rounded-lg ${
              activeTab === "bookings" ? "bg-[#FFB200] text-black" : "text-white"
            }`}
          >
            <i className='bx bx-calendar mr-2'></i>
            Брони
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`mobile-tab-button flex-1 px-3 py-3 rounded-lg ${
              activeTab === "settings" ? "bg-[#FFB200] text-black" : "text-white"
            }`}
          >
            <i className='bx bx-cog mr-2'></i>
            Настройки
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className="flex-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderTabContent()}
      </div>

      {/* Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Детали бронирования</h3>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {selectedBooking.id}</p>
              <p><strong>Период:</strong> {selectedBooking.period}</p>
              <p><strong>Тип номера:</strong> {selectedBooking.roomType}</p>
              <p><strong>Статус:</strong> {selectedBooking.status}</p>
              <p><strong>Сумма:</strong> {selectedBooking.total}₽</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

