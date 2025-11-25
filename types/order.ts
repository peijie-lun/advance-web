// /types/order.ts

export interface Order {
  order_id: string;
  product_name: string;
  amount: number;
  user_id: string;
  custom_order_id?: string | null; // 你的代碼裡有使用 custom_order_id
  created_at?: string;
  updated_at?: string;
}
