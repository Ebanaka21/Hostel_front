'use client';

import { useEffect } from 'react';
import { auth } from '../lib/api';
import { debugToken, checkLocalStorage } from '../lib/token-debug';
import { useRouter } from 'next/navigation';

export function AuthChecker() {
  const router = useRouter();

  useEffect(() => {
    // Проверка токена только на защищенных страницах
    const checkAuth = async () => {
      
      
      const currentPath = window.location.pathname;
      const isProtectedPage = ['/profile'].includes(currentPath);
      
      // На публичных страницах не проверяем токен
      if (!isProtectedPage) {
        
        return;
      }
      
      // Проверяем localStorage
      const token = checkLocalStorage();
      
      if (!token) {
        
        router.push('/login');
        return;
      }
      
      // Проверяем токен на сервере
      try {
       
        const response = await auth.getUser();
        console.log('✅ AuthChecker: токен валидный');
        
        // Если токен валидный, уведомляем об изменении аутентификации
        window.dispatchEvent(new Event('authChange'));
        
      } catch (error: any) {
        
        
        // Токен недействителен, удаляем его
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    // Проверяем только на защищенных страницах
    checkAuth();

    // Слушаем изменения в localStorage (события из других вкладок)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    // Слушаем наши кастомные события авторизации
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [router]);

  return null; // Этот компонент не рендерит ничего
}