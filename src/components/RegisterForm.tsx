'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/api';
import { useToastContext } from './ToastProvider';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToastContext();

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Имя обязательно';
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    if (formData.password !== formData.password_confirmation)
      newErrors.password_confirmation = 'Пароли не совпадают';
    if (!acceptTerms) newErrors.acceptTerms = 'Необходимо принять условия';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await auth.register(formData);
      addToast('Аккаунт создан', 'success');
      router.push('/login');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Ошибка регистрации', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        type="text"
        placeholder="Имя"
        value={formData.name}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      <input
        name="phone"
        type="tel"
        placeholder="Телефон"
        value={formData.phone}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border"
      />

      <input
        name="password"
        type="password"
        placeholder="Пароль"
        value={formData.password}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border"
      />
      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

      <input
        name="password_confirmation"
        type="password"
        placeholder="Подтверждение пароля"
        value={formData.password_confirmation}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border"
      />
      {errors.password_confirmation && (
        <p className="text-red-500 text-sm">{errors.password_confirmation}</p>
      )}

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
        />
        <span>Я принимаю условия использования</span>
      </label>
      {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-700 text-white rounded-lg"
      >
        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
