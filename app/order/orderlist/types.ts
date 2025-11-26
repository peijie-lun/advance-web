// types.ts
export type Order = {
  order_id: string;
  custom_order_id: string | null;
  product_name: string;
  amount: number;
  created_at?: string;
};