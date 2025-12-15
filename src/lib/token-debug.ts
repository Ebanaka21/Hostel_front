// Дебаг утилита для токенов
export function debugToken(token: string | null) {
  if (!token) {
    return;
  }

  // Проверяем структуру JWT токена (должен иметь 3 части разделенные точкой)
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      // Декодируем header и payload (base64 decode)
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Проверяем срок действия токена
      if (payload.exp) {
        const expiresIn = payload.exp * 1000; // В миллисекундах
        const now = Date.now();
        const isExpired = now >= expiresIn;
        
        if (isExpired) {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      // Ошибка декодирования JWT
    }
  }
}

export function checkLocalStorage() {
  const token = localStorage.getItem('token');
  return token;
}
