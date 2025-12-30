'use client';

import React from 'react';
import CartDrawer from '../order/orderlist/components/CartDrawer';
import { Box } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CartPage() {
  const userId = supabase.auth.getUser().then((res) => res.data.user?.id ?? null);// 取得目前使用者 ID //取得目前使用者的 ID，如果沒有登入則為 null  //這裡使用了 Supabase 的 getUser 方法來獲取當前使用者的資訊，並從中提取使用者 ID。
//當 getUser() 執行完畢後，會取得一個 res 物件。
// res.data.user?.id 會嘗試取得 user 物件的 id 屬性。
  return (
    <Box sx={{ mt: 4 }}>
      {/* 使用 CartDrawer 作為主要內容 */}
      <CartDrawer userId={userId as any} onClose={() => {}} />
    </Box>
  );
}
// userId：傳給 CartDrawer 的使用者 ID（這裡用 userId as any 是為了繞過型別檢查）。
// onClose：傳入一個空的關閉函式（目前什麼都不做）。