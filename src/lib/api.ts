// src/lib/api.ts
import axios from "axios";

export type RoomType = {
  id: string | number;
  type_name: string;
  slug: string;
  cheapest_price: number;
  capacity: number;
  available_count: number;
  photos?: string[] | null;
  amenities?: string[] | null;
  description?: string | null;
  price_per_night?: number;
  name?: string;
  cheapest_room_id?: string | number;
};

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

export const auth = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post("/login", data);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("authChange"));
    }
    return res;
  },
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
  },
  getUser: () => api.get("/me"),
};
export const roomTypes = {
  // Все типы номеров (без фильтра по датам)
  getAll: async (params?: { check_in?: string; check_out?: string; guests?: number }) => {
    const res = await api.get("/rooms", { params });
    return {
      data: res.data.map((r: RoomType) => ({
        ...r,
        id: r.cheapest_room_id || r.id || Math.random(),
        type_name: r.type_name || r.name || "Номер",
        cheapest_price: r.cheapest_price || r.price_per_night,
      })),
    };
  },
  // Получение комнаты по ID (через загрузку доступных комнат с датами)
  getById: async (id: string | number, checkIn?: string, checkOut?: string) => {
    const idStr = id.toString();
    
    // Если есть даты, ищем через available
    if (checkIn && checkOut) {
      const res = await api.get("/rooms/available", { params: { check_in: checkIn, check_out: checkOut } });
      const rooms = res.data;
      const r = rooms.find((room: RoomType) => room.id?.toString() === idStr);
      if (r) {
        return {
          data: {
            ...r,
            id: Number(r.id),
            type_name: r.name || r.type_name || "Номер",
            cheapest_price: Number(r.price_per_night || r.cheapest_price),
            slug: r.slug || '',
            capacity: Number(r.capacity),
            available_count: r.available_count || 1,
            photos: r.photos || [],
            amenities: r.amenities || [],
            description: r.description,
          },
        };
      }
    }
    
    // Fallback: ищем через /rooms
    const res = await api.get("/rooms");
    const rooms = res.data;
    const r = rooms.find((room: RoomType) => 
      room.id?.toString() === idStr || 
      room.cheapest_room_id?.toString() === idStr
    );
    if (!r) {
      console.warn(`Room not found by ID: ${id}`);
      return { data: null };
    }
    return {
      data: {
        ...r,
        id: Number(r.id || r.cheapest_room_id),
        type_name: r.name || r.type_name || "Номер",
        cheapest_price: Number(r.price_per_night || r.cheapest_price),
        slug: r.slug || '',
        capacity: Number(r.capacity),
        available_count: r.available_count || 1,
        photos: r.photos || [],
        amenities: r.amenities || [],
        description: r.description,
      },
    };
  },
  // НОВЫЙ МЕТОД — поиск доступных номеров по датам
  available: async (params: { check_in: string; check_out: string; guests?: string | number }) => {
    const res = await api.get("/rooms/available", { params });
    return {
      data: res.data.map((r: RoomType) => ({
        ...r,
        id: r.id || Date.now() + Math.random(), // если бэкенд не даёт id
        type_name: r.name,
        cheapest_price: r.price_per_night,
        slug: r.slug || '',
        capacity: r.capacity,
        available_count: r.available_count || 1,
        photos: r.photos || [],
        amenities: r.amenities || [],
        description: r.description,
      })),
    };
  },
};

type BookingPayload = {
  room_id: string | number;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  special_requests?: string;
};

export const bookings = {
  getAll: () => api.get("/my-bookings"),
  create: (payload: BookingPayload) => api.post("/bookings", payload),
  pay: (id: number) => api.post(`/bookings/${id}/pay`),
  cancel: (id: number) => api.post(`/bookings/${id}/cancel`),
};

export default api;