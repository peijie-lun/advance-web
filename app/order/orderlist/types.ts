// types.ts
export type Order = {
  order_id: string;
  product_name: string;
  amount: number;
  created_at?: string;
};