// Дебаг утилита для токенов
export function debugToken(token: string | null) {
  if (!token) {
    console.log('🔍 TOKEN DEBUG: Токен отсутствует в localStorage');
    return;
  }

  console.log('🔍 TOKEN DEBUG: Токен найден:', {
    length: token.length,
    firstChars: token.substring(0, 20) + '...',
    lastChars: '...' + token.substring(token.length - 20),
    type: typeof token
  });

  // Проверяем структуру JWT токена (должен иметь 3 части разделенные точкой)
  const parts = token.split('.');
  if (parts.length === 3) {
    console.log('🔍 TOKEN DEBUG: JWT структура валидная (3 части)');
    
    try {
      // Декодируем header и payload (base64 decode)
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('🔍 TOKEN DEBUG: JWT Header:', header);
      console.log('🔍 TOKEN DEBUG: JWT Payload:', payload);
      
      // Проверяем срок действия токена
      if (payload.exp) {
        const expiresIn = payload.exp * 1000; // В миллисекундах
        const now = Date.now();
        const isExpired = now >= expiresIn;
        
        console.log('🔍 TOKEN DEBUG: Токен истекает:', new Date(expiresIn).toLocaleString());
        console.log('🔍 TOKEN DEBUG: Текущее время:', new Date(now).toLocaleString());
        console.log('🔍 TOKEN DEBUG: Статус истечения:', isExpired ? 'ИСТЕК' : 'ДЕЙСТВУЕТ');
        
        if (isExpired) {
          console.log('❌ TOKEN DEBUG: Токен истек, удаляем');
          localStorage.removeItem('token');
        }
      } else {
        console.log('⚠️ TOKEN DEBUG: Нет поля exp в токене');
      }
      
    } catch (error) {
      console.log('❌ TOKEN DEBUG: Ошибка декодирования JWT:', error);
    }
  } else {
    console.log('❌ TOKEN DEBUG: Некорректная JWT структура, частей:', parts.length);
  }
}

export function checkLocalStorage() {
  const token = localStorage.getItem('token');
  console.log('🔍 LOCALSTORAGE DEBUG: Содержимое localStorage:');
  console.log('- token:', token ? 'Присутствует' : 'Отсутствует');
  console.log('- Все ключи:', Object.keys(localStorage));
  
  return token;
}