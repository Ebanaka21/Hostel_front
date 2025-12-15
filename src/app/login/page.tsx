'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../lib/api';
import { useToastContext } from '../../components/ToastProvider';
import { AuthChecker } from '../../components/AuthChecker';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToastContext();

  const validateForm = () => {
    const newErrors: FormErrors = {
      email: '',
      password: '',
    };

    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await auth.login({
        email: formData.email,
        password: formData.password,
      });
      addToast('Вход выполнен', 'success');
      router.push('/profile');
    } catch (error: unknown) {
      console.error('Error:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Ошибка авторизации';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      <div className="black-gold-form rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg relative z-10 animate-fade-in hover:shadow-3xl transition-shadow duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center animate-rotate-gold">
            <i className="bx bx-user text-black text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Вход в аккаунт
          </h1>
          <p className="text-gray-400 text-sm">Добро пожаловать обратно</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-slide-in">
            <label className="block text-sm font-medium mb-3 text-white flex items-center">
              <i className="bx bx-envelope mr-2 text-gray-400"></i>
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-4 pr-4 py-4 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium mb-3 text-white flex items-center">
              <i className="bx bx-lock-alt mr-2 text-gray-400"></i>
              Пароль
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full pl-4 pr-4 py-4 gold-input rounded-lg text-white placeholder-gray-400 focus:gold-glow transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 gold-button rounded-lg font-semibold text-black transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="bx bx-loader-circle bx-spin mr-2"></i>
                Загрузка...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/register"
            className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center justify-center"
          >
            <i className="bx bx-user-plus mr-2"></i>
            Нет аккаунта? Зарегистрироваться
          </Link>
        </div>

        <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors duration-300">Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
}

