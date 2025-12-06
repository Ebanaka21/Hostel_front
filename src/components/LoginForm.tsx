'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/api';
import { useToastContext } from './ToastProvider';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToastContext();

  const validate = () => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Email обязателен';
    if (!password) newErrors.password = 'Пароль обязателен';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await auth.login({ email, password });
      addToast('Вход выполнен', 'success');
      router.push('/profile');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Ошибка входа', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border"
      />
      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-700 text-white rounded-lg"
      >
        {loading ? 'Загрузка...' : 'Войти'}
      </button>
    </form>
  );
}
