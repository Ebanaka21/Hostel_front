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
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
      });
      addToast('Регистрация успешна!', 'success');
      router.push('/profile');
    } catch (error: any) {
      console.error('Error:', error);
      addToast(error.response?.data?.message || 'Ошибка регистрации', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center bg-[#272727] px-4 sm:px-6">
      <AuthChecker />
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg animate-slide-in hover:shadow-3xl transition-shadow duration-300 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Создать аккаунт
        </h1>
        <p className="text-center text-gray-400 mb-6">Присоединяйтесь к нашему сообществу</p>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div className="animate-slide-in relative">
            <label className="block text-sm font-medium mb-2">Имя</label>
            <div className="relative">
              <i className="bx bx-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                required
              />
            </div>
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <i className="bx bx-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                required
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium mb-2">Телефон</label>
            <div className="relative">
              <i className="bx bx-phone absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
              />
            </div>
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.3s' }}>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <div className="relative">
              <i className="bx bx-lock-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                required
              />
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="animate-slide-in relative" style={{ animationDelay: '0.4s' }}>
            <label className="block text-sm font-medium mb-2">Подтверждение пароля</label>
            <div className="relative">
              <i className="bx bx-lock-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
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
                className="mr-2"
              />
              <span className="text-sm">Я принимаю правила</span>
            </label>
            {errors.terms && <p className="text-red-400 text-sm mt-1">{errors.terms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#251030] hover:bg-[#3a1a4a] disabled:bg-gray-600 rounded-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-[#251030]/60 hover:scale-105 animate-pulse-glow text-base sm:text-lg"
          >
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link href="/login" className="text-[#3a1a4a] hover:text-[#251030] transition-colors duration-300">
            Уже есть аккаунт? Войти
          </Link>
        </div>

        <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-300">Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
}