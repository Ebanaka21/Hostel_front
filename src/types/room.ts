// src/types/room.ts
export interface RoomType {
  id: number;                    // ← это cheapest_room_id
  type_name: string;
  slug: string;
  cheapest_price: number;
  capacity: number;
  available_count?: number;
  photos?: string[];
  amenities?: string[];
  description?: string;
}

export interface BookingData {
  room: RoomType | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  guestData: {
    name: string;
    surname: string;
    second_name: string;
    birthday: string;
    phone: string;
    passport_series: string;
    passport_number: string;
    passport_issued_at: string;
    passport_issued_by: string;
  };
}