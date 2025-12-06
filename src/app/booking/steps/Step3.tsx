'use client';

import { useEffect } from 'react';
import { auth } from '../../../lib/api';

export default function Step3({ data, setData, next, prev }) {
  // Автозаполнение из профиля при монтировании
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await auth.getUser();
        const user = res.data;
        setData({
          ...data,
          guestData: {
            name: user.name || '',
            surname: user.surname || '',
            second_name: user.second_name || '',
            birthday: user.birthday || '',
            phone: user.phone || '',
            passport_series: user.passport_series || '',
            passport_number: user.passport_number || '',
            passport_issued_at: user.passport_issued_at || '',
            passport_issued_by: user.passport_issued_by || '',
          }
        });
      } catch (err) {
        console.log('Профиль не загружен — заполняйте вручную');
      }
    };
    loadProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setData({
      ...data,
      guestData: { ...data.guestData, [field]: value }
    });
  };

  const isValid = () => {
    const g = data.guestData;
    return g.name && g.surname && g.phone && g.passport_series && g.passport_number;
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Данные гостя</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <input type="text" placeholder="Имя" value={data.guestData.name}
          onChange={e => handleChange('name', e.target.value)}
          className="p-4 bg-gray-700 rounded-xl" />

        <input type="text" placeholder="Фамилия" value={data.guestData.surname}
          onChange={e => handleChange('surname', e.target.value)}
          className="p-4 bg-gray-700 rounded-xl" />

        <input type="text" placeholder="Отчество" value={data.guestData.second_name}
          onChange={e => handleChange('second_name', e.target.value)}
          className="p-4 bg-gray-700 rounded-xl" />

        <input type="date" placeholder="Дата рождения" value={data.guestData.birthday}
          onChange={e => handleChange('birthday', e.target.value)}
          className="p-4 bg-gray-700 rounded-xl" />

        <input type="tel" placeholder="Телефон" value={data.guestData.phone}
          onChange={e => handleChange('phone', e.target.value)}
          className="p-4 bg-gray-700 rounded-xl" />

        <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
          <input type="text" placeholder="Серия паспорта" value={data.guestData.passport_series}
            onChange={e => handleChange('passport_series', e.target.value)}
            className="p-4 bg-gray-700 rounded-xl" />

          <input type="text" placeholder="Номер паспорта" value={data.guestData.passport_number}
            onChange={e => handleChange('passport_number', e.target.value)}
            className="p-4 bg-gray-700 rounded-xl" />

          <input type="date" placeholder="Дата выдачи" value={data.guestData.passport_issued_at}
            onChange={e => handleChange('passport_issued_at', e.target.value)}
            className="p-4 bg-gray-700 rounded-xl" />
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={prev} className="px-8 py-4 bg-gray-700 rounded-xl">Назад</button>
        <button onClick={next} disabled={!isValid()}
          className="px-12 py-4 bg-yellow-500 text-black rounded-xl font-bold disabled:opacity-50">
          Продолжить
        </button>
      </div>
    </div>
  );
}