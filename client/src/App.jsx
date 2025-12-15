
import React from "react";
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { api } from './api';

function parseManualArray(input) {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    throw new Error('Введите хотя бы одно число');
  }
  
  const parts = trimmedInput.split(/[,\s]+/);
  const result = [];
  const errors = [];
  
  parts.forEach((part, index) => {
    const trimmedPart = part.trim();
    if (trimmedPart === '') return;
    
    const asNumber = Number(trimmedPart);
    if (!Number.isFinite(asNumber)) {
      errors.push(`"${trimmedPart}" (позиция ${index + 1}) не является числом`);
      return;
    }
    
    if (asNumber < -1000000 || asNumber > 1000000) {
      errors.push(`Число ${asNumber} (позиция ${index + 1}) выходит за пределы (-1,000,000 до 1,000,000)`);
      return;
    }
    
    result.push(Math.trunc(asNumber));
  });
  
  if (errors.length > 0) {
    throw new Error(`Ошибки в массиве:\n${errors.join('\n')}`);
  }
  
  if (result.length === 0) {
    throw new Error('Не найдено ни одного корректного числа');
  }
  
  if (result.length > 10000) {
    throw new Error(`Слишком много элементов (${result.length}). Максимум: 10,000`);
  }
  
  return result;
}

function generateRandomArray({ length, min, max }) {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const result = [];
  for (let i = 0; i < length; i += 1) {
    result.push(Math.floor(Math.random() * (upper - lower + 1)) + lower);
  }
  return result;
}

function Notification({ status }) {
  if (!status) return null;
  return (
    <div className={`notification ${status.type}`}>
      <strong>{status.type === 'error' ? 'Ошибка:' : 'Статус:'}</strong> {status.message}
    </div>
  );
}

function SavedArrays({ items, isLoading, onRefresh, onDelete }) {
  return (
    <section className="card">
      <div className="section-header">
        <h2>Сохранённые массивы</h2>
        <button type="button" onClick={onRefresh} className="secondary">
          Обновить
        </button>
      </div>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : items.length === 0 ? (
        <p>Сохранённых массивов пока нет.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Метка</th>
                <th>Оригинал</th>
                <th>Отсортирован</th>
                <th>Сохранено</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.label || 'Без названия'}</td>
                  <td>{item.save_original ? item.original_data.join(', ') : '—'}</td>
                  <td>{item.save_sorted ? item.sorted_data.join(', ') : '—'}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>
                    <button type="button" className="link" onClick={() => onDelete(item.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ArrayWorkbench({
  disabled,
  processArray,
  lastProcessing,
}) {
  const [mode, setMode] = useState('manual');
  const [manualInput, setManualInput] = useState('9, 3, 7, 1, 8');
  const [manualError, setManualError] = useState('');
  const [randomOptions, setRandomOptions] = useState({ length: 10, min: 0, max: 100 });
  const [saveOriginal, setSaveOriginal] = useState(true);
  const [saveSorted, setSaveSorted] = useState(true);
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(() => {
    try {
      if (mode === 'manual') {
        const parsed = parseManualArray(manualInput);
        setManualError('');
        return parsed;
      }
      const generated = generateRandomArray(randomOptions);
      
      // Валидация случайного массива
      if (generated.length === 0) {
        setManualError('Невозможно сгенерировать массив с указанными параметрами');
        return [];
      }
      if (randomOptions.min < -1000000 || randomOptions.max > 1000000) {
        setManualError('Диапазон значений выходит за допустимые пределы (-1,000,000 до 1,000,000)');
        return [];
      }
      if (randomOptions.length > 10000) {
        setManualError('Количество элементов не должно превышать 10,000');
        return [];
      }
      
      setManualError('');
      return generated;
    } catch (error) {
      if (mode === 'manual') {
        setManualError(error.message);
      }
      return [];
    }
  }, [manualInput, mode, randomOptions]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled) return;
    
    // Проверка валидации перед отправкой
    if (manualError && mode === 'manual') {
      return;
    }
    
    if (preview.length === 0) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Создаем копию массива для отправки
      let numbersToSend;
      if (mode === 'manual') {
        numbersToSend = parseManualArray(manualInput);
      } else {
        numbersToSend = generateRandomArray(randomOptions);
      }
      
      // Отправляем копию массива, сохраняя preview неизменным
      await processArray({ 
        numbers: [...numbersToSend], 
        label, 
        saveOriginal, 
        saveSorted 
      });
      
    } catch (error) {
      // Ошибки уже обрабатываются в processArray
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Работа с массивами</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field-group">
          <label>Способ ввода</label>
          <div className="segmented">
            <button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => {
              setMode('manual');
              setManualError('');
            }}>
              Клавиатура
            </button>
            <button type="button" className={mode === 'random' ? 'active' : ''} onClick={() => {
              setMode('random');
              setManualError('');
            }}>
              Случайно
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
          <div className="field-group">
            <label>
              Массив через запятую
              <textarea
                value={manualInput}
                onChange={(event) => {
                  setManualInput(event.target.value);
                  // Сбрасываем ошибку при изменении
                  if (manualError) {
                    try {
                      parseManualArray(event.target.value);
                      setManualError('');
                    } catch {
                      // Ошибка останется до следующего вычисления preview
                    }
                  }
                }}
                placeholder="Например: 9, 3, 7, -5, 42"
                rows={4}
                required
                className={manualError ? 'input-error' : ''}
              />
            </label>
            {manualError && (
              <div className="error-message">
                <small style={{ color: '#dc2626', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
                  ⚠️ {manualError}
                </small>
              </div>
            )}
            <div className="validation-hint">
              <small>
                Правила ввода:
                <ul>
                  <li>Числа разделяются запятыми или пробелами</li>
                  <li>Допустимый диапазон: от -1,000,000 до 1,000,000</li>
                  <li>Максимум 10,000 элементов</li>
                  <li>Дробные числа будут округлены до целых</li>
                </ul>
              </small>
            </div>
          </div>
        ) : (
          <div className="random-options">
            <label>
              Кол-во элементов
              <input
                type="number"
                min="1"
                max="10000"
                value={randomOptions.length}
                onChange={(event) => {
                  const value = Math.max(1, Math.min(10000, Number(event.target.value) || 1));
                  setRandomOptions((prev) => ({ ...prev, length: value }));
                }}
              />
            </label>
            <label>
              Минимум
              <input
                type="number"
                value={randomOptions.min}
                onChange={(event) => {
                  const value = Number(event.target.value) || 0;
                  setRandomOptions((prev) => ({ ...prev, min: Math.max(-1000000, value) }));
                }}
                min="-1000000"
                max="1000000"
              />
            </label>
            <label>
              Максимум
              <input
                type="number"
                value={randomOptions.max}
                onChange={(event) => {
                  const value = Number(event.target.value) || 0;
                  setRandomOptions((prev) => ({ ...prev, max: Math.min(1000000, value) }));
                }}
                min="-1000000"
                max="1000000"
              />
            </label>
            {randomOptions.min > randomOptions.max && (
              <div className="error-message" style={{ gridColumn: '1 / -1' }}>
                <small style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                  ⚠️ Минимальное значение не должно превышать максимальное
                </small>
              </div>
            )}
          </div>
        )}

        <label className="field-group">
          Подпись результата (опционально)
          <input type="text" value={label} onChange={(event) => setLabel(event.target.value)} maxLength={120} />
        </label>

        <div className="checkboxes">
          <label>
            <input type="checkbox" checked={saveOriginal} onChange={(event) => setSaveOriginal(event.target.checked)} />
            Сохранить исходный массив
          </label>
          <label>
            <input type="checkbox" checked={saveSorted} onChange={(event) => setSaveSorted(event.target.checked)} />
            Сохранить отсортированный массив
          </label>
        </div>

        <div className="summary-panel">
          <div>
            <p>
              <strong>Предпросмотр:</strong> {preview.slice(0, 20).join(', ')}
              {preview.length > 20 && ' …'}
            </p>
            <p>
              <small>
                Элементов: {preview.length}
                {preview.length >= 10000 && ' (максимум)'}
              </small>
            </p>
            {preview.length > 0 && (
              <p>
                <small>
                  Диапазон: {Math.min(...preview)} … {Math.max(...preview)}
                </small>
              </p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={disabled || isSubmitting || (mode === 'manual' && manualError) || preview.length === 0 || (mode === 'random' && randomOptions.min > randomOptions.max)}
          >
            {isSubmitting ? 'Обработка…' : 'Отсортировать и сохранить'}
          </button>
        </div>
      </form>

      {lastProcessing && (
        <div className="result-panel">
          <h3>Последний результат</h3>
          <p>
            <strong>Оригинал:</strong> {lastProcessing.original.join(', ')}
          </p>
          <p>
            <strong>Отсортирован:</strong> {lastProcessing.sorted.join(', ')}
          </p>
          {lastProcessing.saved && <p className="success">Массив был сохранён в базе данных.</p>}
        </div>
      )}
    </section>
  );
}

function AuthPanel({ mode, setMode, credentials, setCredentials, onSubmit, disabled }) {
  return (
    <section className="card auth-panel">
      <h2>{mode === 'login' ? 'Авторизация' : 'Регистрация'}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="form-grid"
      >
        <label>
          Логин
          <input
            type="text"
            value={credentials.username}
            onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
            required
            minLength={3}
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={credentials.password}
            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
            required
            minLength={6}
          />
        </label>
        <button type="submit" disabled={disabled}>
          {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
      <p>
        {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Зарегистрируйтесь' : 'Авторизуйтесь'}
        </button>
      </p>
    </section>
  );
}

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [lastProcessing, setLastProcessing] = useState(null);
  const [arrays, setArrays] = useState([]);
  const [isLoadingArrays, setIsLoadingArrays] = useState(false);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  const loadArrays = async () => {
    if (!token) return;
    setIsLoadingArrays(true);
    try {
      const data = await api.fetchArrays(token, { limit: 10 });
      setArrays(data.items);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoadingArrays(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let ignore = false;
    api
      .profile(token)
      .then((data) => {
        if (!ignore) {
          setUser(data.user);
          setStatus({ type: 'success', message: `Добро пожаловать, ${data.user.username}` });
          loadArrays();
        }
      })
      .catch((error) => {
        console.error(error);
        if (!ignore) {
          handleLogout();
          setStatus({ type: 'error', message: 'Сессия устарела, авторизуйтесь снова' });
        }
      });
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleAuth = async () => {
    try {
      setAuthLoading(true);
      const payload = {
        username: credentials.username.trim().toLowerCase(),
        password: credentials.password,
      };
      const data = await api[authMode](payload);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStatus({ type: 'success', message: authMode === 'login' ? 'Вход выполнен' : 'Регистрация успешна' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setArrays([]);
  };

  const handleProcessArray = async ({ numbers, label, saveOriginal, saveSorted }) => {
    if (!token) {
      setStatus({ type: 'error', message: 'Сначала авторизуйтесь' });
      throw new Error('Нет токена');
    }
    
    // Сохраняем оригинальный массив ДО отправки
    const originalNumbers = [...numbers];
    
    // Дополнительная валидация перед отправкой
    if (!saveOriginal && !saveSorted) {
      const message = 'Выберите хотя бы один вариант сохранения';
      setStatus({ type: 'error', message });
      throw new Error(message);
    }
    
    // Проверка массива через api.validateArray
    const validation = api.validateArray(numbers);
    if (!validation.valid) {
      setStatus({ type: 'error', message: validation.message });
      throw new Error(validation.message);
    }
    
    setStatus({ type: 'info', message: 'Проводится сортировка массива...' });
    try {
      const result = await api.processArray(token, {
        numbers,
        label,
        saveOriginal,
        saveSorted,
      });
      
      // Используем сохраненный оригинальный массив
      setLastProcessing({ 
        original: originalNumbers, 
        sorted: result.sorted, 
        saved: result.saved 
      });
      
      setStatus({ type: 'success', message: 'Массив успешно обработан' });
      if (result.saved) {
        loadArrays();
      }
      return result;
    } catch (error) {
      // Улучшенное отображение ошибок от сервера
      let errorMessage = error.message;
      if (error.message.includes('Failed to process array') || error.message.includes('Provide at least one number')) {
        errorMessage = 'Ошибка обработки массива. Проверьте корректность введённых данных.';
      } else if (error.message.includes('Array must contain only finite numbers')) {
        errorMessage = 'Массив должен содержать только корректные числа.';
      } else if (error.message.includes('numbers must be an array')) {
        errorMessage = 'Входные данные должны быть массивом чисел.';
      }
      setStatus({ type: 'error', message: errorMessage });
      throw error;
    }
  };

  const handleDeleteArray = async (id) => {
    if (!token) return;
    try {
      await api.deleteArray(token, id);
      await loadArrays();
      setStatus({ type: 'success', message: 'Запись удалена' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="app">
      <header>
        <div>
          <h1>Lab 3: массивы и сортировка</h1>
          <p>Графический интерфейс + БД + алгоритм сортировки второго задания</p>
        </div>
        {user && (
          <div className="user-info">
            <span>👤 {user.username}</span>
            <button type="button" onClick={handleLogout} className="secondary">
              Выйти
            </button>
          </div>
        )}
      </header>

      <Notification status={status} />

      {!user ? (
        <div className="grid">
          <AuthPanel
            mode={authMode}
            setMode={setAuthMode}
            credentials={credentials}
            setCredentials={setCredentials}
            onSubmit={handleAuth}
            disabled={isAuthLoading}
          />
        </div>
      ) : (
        <div className="grid">
          <ArrayWorkbench disabled={!user} processArray={handleProcessArray} lastProcessing={lastProcessing} />

          <SavedArrays items={arrays} isLoading={isLoadingArrays} onRefresh={loadArrays} onDelete={handleDeleteArray} />
        </div>
      )}
    </div>
  );
}

export default App;