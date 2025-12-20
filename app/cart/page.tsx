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
  const userId = supabase.auth.getUser().then((res) => res.data.user?.id ?? null);

  return (
    <Box sx={{ mt: 4 }}>
      {/* 使用 CartDrawer 作為主要內容 */}
      <CartDrawer userId={userId as any} onClose={() => {}} />
    </Box>
  );
}
