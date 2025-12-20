'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CartDrawerProps {
  userId: string | null;
  onClose: () => void;
}

interface CartItem {
  cart_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export default function CartDrawer({ userId, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    const { data, error } = await supabase
      .from('cart')
      .select('cart_id, quantity, products(product_name, price)')
      .eq('user_id', userId);
    if (!error && data) {
      const items = (data as any[]).map((c) => ({
        cart_id: c.cart_id,
        product_id: c.product_id,
        product_name: c.products.product_name,
        price: c.products.price,
        quantity: c.quantity,
      }));
      setCart(items);
    }
  };

  const updateQuantity = async (cartId: string, qty: number) => {
    if (qty <= 0) return;
    await supabase.from('cart').update({ quantity: qty }).eq('cart_id', cartId);
    fetchCart();
  };

  const removeItem = async (cartId: string) => {
    await supabase.from('cart').delete().eq('cart_id', cartId);
    fetchCart();
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <Box sx={{ width: 350, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>我的購物車</Typography>
      {cart.length === 0 ? (
        <Typography>購物車目前沒有商品</Typography>
      ) : (
        <Box>
          {cart.map((item) => (
            <Box key={item.cart_id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ flex: 1 }}>{item.product_name}</Typography>
              <TextField
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.cart_id, Number(e.target.value))}
                sx={{ width: 60, mr: 1 }}
              />
              <Typography sx={{ width: 70 }}>NT$ {item.price * item.quantity}</Typography>
              <IconButton color="error" onClick={() => removeItem(item.cart_id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>總金額: NT$ {total}</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} fullWidth onClick={onClose}>
            結帳
          </Button>
        </Box>
      )}
    </Box>
  );
}
