const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Преобразуем сообщения об ошибках на русский
    const errorMessage = data?.message || 'Ошибка запроса';
    const russianMessages = {
      'Invalid credentials': 'Неверные учетные данные (логин или пароль)',
      'User already exists': 'Пользователь с таким логином уже существует',
      'Username already taken': 'Это имя пользователя уже занято',
      'username is required': 'Логин обязателен для заполнения',
      'password is required': 'Пароль обязателен для заполнения',
      'Username must be at least 3 characters': 'Логин должен содержать не менее 3 символов',
      'Password must be at least 6 characters': 'Пароль должен содержать не менее 6 символов',
      'Failed to process array': 'Ошибка обработки массива',
      'Provide at least one number': 'Предоставьте хотя бы одно число',
      'Array must contain only finite numbers': 'Массив должен содержать только корректные числа',
      'numbers must be an array': 'Входные данные должны быть массивом чисел',
      'Unauthorized': 'Требуется авторизация',
      'Forbidden': 'Доступ запрещен',
      'Not Found': 'Ресурс не найден',
    };
    
    // Проверяем частичное совпадение для более гибкой обработки
    let translatedMessage = errorMessage;
    for (const [key, value] of Object.entries(russianMessages)) {
      if (errorMessage.includes(key)) {
        translatedMessage = value;
        break;
      }
    }
    
    throw new Error(translatedMessage);
  }
  return data;
}

export const api = {
  register: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  profile: (token) => request('/profile', { token }),
  processArray: (token, payload) => request('/arrays/process', { method: 'POST', token, body: payload }),
  fetchArrays: (token, { page = 1, limit = 20 } = {}) =>
    request(`/arrays?page=${page}&limit=${limit}`, { token }),
  deleteArray: (token, id) => request(`/arrays/${id}`, { method: 'DELETE', token }),
  validateArray: (numbers) => {
    // Локальная валидация на фронтенде
    try {
      if (!Array.isArray(numbers)) {
        return { valid: false, message: 'Входные данные должны быть массивом' };
      }
      if (numbers.length === 0) {
        return { valid: false, message: 'Массив не должен быть пустым' };
      }
      if (numbers.length > 10000) { // Синхронизируем с фронтендом
        return { valid: false, message: 'Массив слишком большой (максимум 10,000 элементов)' };
      }
      for (let i = 0; i < numbers.length; i++) {
        const num = Number(numbers[i]);
        if (!Number.isFinite(num)) {
          return { valid: false, message: `Элемент "${numbers[i]}" не является числом` };
        }
        if (num < -1000000 || num > 1000000) {
          return { valid: false, message: `Число ${num} выходит за допустимые пределы (-1,000,000 до 1,000,000)` };
        }
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Ошибка при валидации массива' };
    }
  }
};