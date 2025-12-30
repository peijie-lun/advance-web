'use client';
//購物車頁面，顯示使用者的購物車內容
//主要使用 CartDrawer 元件來呈現購物車內容

import React from 'react';
import CartDrawer from '../order/orderlist/components/CartDrawer';
import { Box } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CartPage() {
  const userId = supabase.auth.getUser().then((res) => res.data.user?.id ?? null);//取得目前使用者的 ID
//當取得結果後，從回傳的 res 物件裡拿出 user 的 id。如果 user 不存在（沒登入），就回傳 null。
  return (
    <Box sx={{ mt: 4 }}>
      {/* 使用 CartDrawer 作為主要內容 */}
      <CartDrawer userId={userId as any} onClose={() => {}} />
    </Box>
  );
}
