'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../lib/api';
import { useToastContext } from '../../components/ToastProvider';
import { AuthChecker } from '../../components/AuthChecker';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    terms: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToastContext();

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      terms: '',
    };

    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Пароли не совпадают';
    }
    if (!acceptedTerms) newErrors.terms = 'Необходимо принять правила';

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await auth.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      addToast('Регистрация успешна!', 'success');
      router.push('/profile');
    } catch (error: unknown) {
      console.error('Error:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Ошибка регистрации';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center black-gold-bg px-4 sm:px-6 relative overflow-hidden">
      <AuthChecker />
      
      {/* Декоративные золотые элементы */}
      <div className="gold-decoration" style={{ top: '10%', left: '10%' }}></div>
      <div className="gold-decoration" style={{ top: '20%', right: '15%' }}></div>
      <div className="gold-decoration" style={{ bottom: '30%', left: '20%' }}></div>
      <div className="gold-decoration" style={{ bottom: '20%', right: '10%' }}></div>
      <div className="gold-decoration" style={{ top: '60%', left: '5%' }}></div>
      <div className="gold-decoration" style={{ top: '70%', right: '25%' }}></div>
      <div className="gold-decoration" style={{ bottom: '10%', left: '50%' }}></div>

      <div className="black-gold-form rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg relative z-10 animate-fade-in hover:shadow-3xl transition-shadow duration-300 my-10">
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center animate-rotate-gold">
            <i className="bx bx-user-plus text-black text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Создать аккаунт
          </h1>
          <p className="text-gray-400 text-xs">Присоединяйтесь к нашему сообществу</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div className="animate-slide-in relative">
            <label className="block text-sm font-medium mb-2 text-white flex items-center">
              <i className="bx bx-user mr-2 text-gray-400"></i>
              Имя
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-3 pr-3 py-3 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
                required
              />
            </div>
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium mb-2 text-white flex items-center">
              <i className="bx bx-envelope mr-2 text-gray-400"></i>
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-3 pr-3 py-3 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
                required
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium mb-2 text-white flex items-center">
              <i className="bx bx-phone mr-2 text-gray-400"></i>
              Телефон
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-3 pr-3 py-3 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
              />
            </div>
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.3s' }}>
            <label className="block text-sm font-medium mb-2 text-white flex items-center">
              <i className="bx bx-lock-alt mr-2 text-gray-400"></i>
              Пароль
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-3 pr-3 py-3 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
                required
              />
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.4s' }}>
            <label className="block text-sm font-medium mb-2 text-white flex items-center">
              <i className="bx bx-lock-alt mr-2 text-gray-400"></i>
              Подтверждение пароля
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                className="w-full pl-3 pr-3 py-3 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
                required
              />
            </div>
            {errors.password_confirmation && <p className="text-red-400 text-sm mt-1">{errors.password_confirmation}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.5s' }}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2 w-4 h-4 text-yellow-500 bg-transparent border-gray-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-white">Я принимаю правила</span>
            </label>
            {errors.terms && <p className="text-red-400 text-sm mt-1">{errors.terms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="w-full px-3 sm:px-4 py-3 gold-button rounded-lg font-semibold text-black transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base animate-gold-pulse"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="bx bx-loader-circle bx-spin mr-2"></i>
                Загрузка...
              </span>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center justify-center text-sm">
            <i className="bx bx-log-in mr-1"></i>
            Уже есть аккаунт? Войти
          </Link>
        </div>

        <div className="text-center mt-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors duration-300 text-sm">Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
}