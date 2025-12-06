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
      const message = error instanceof Error && 'response' in error ? (error as any).response?.data?.message : 'Ошибка авторизации';
      addToast(message || 'Ошибка авторизации', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#272727] px-4 sm:px-6">
      <AuthChecker />
      <div className="bg-[#2E2D2D] backdrop-blur-sm rounded-xl p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Вход в аккаунт
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Email</label>
            <div className="relative">
              <i className="bx bx-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Пароль</label>
            <div className="relative">
              <i className="bx bx-lock-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#272727]  rounded-lg font-semibold transition-all duration-300 text-white hover:shadow-xl"
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/register"
            className="text-[#A7A7A7c] hover:text-[#251030] transition-colors duration-300"
          >
            Нет аккаунта? Зарегистрироваться
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-300">Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
}
