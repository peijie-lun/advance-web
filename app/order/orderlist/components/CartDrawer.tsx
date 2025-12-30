'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
//購物車抽屜元件，負責顯示、操作購物車內容與結帳
// 建立 Supabase client，讓本元件能操作資料庫

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
  // cart: 購物車商品陣列
  const [cart, setCart] = useState<CartItem[]>([]);//購物車商品陣列  //用來儲存從資料庫撈取到的購物車商品資料。
  // loading: 結帳時的載入狀態
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 當 userId 變動時，自動撈取購物車內容
  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  // 從資料庫撈取購物車商品
  const fetchCart = async () => {// 從 Supabase 的 cart 資料表撈取目前使用者的購物車內容
    const { data, error } = await supabase
      .from('cart')
      .select('cart_id, product_id, quantity, products(product_id, name, price)')
      .eq('user_id', userId);
    if (!error && data) {
      // 將資料轉換成前端需要的格式
      const items = (data as any[]).map((c) => ({//轉換成前端需要的格式存進 cart 狀態。 //any表示不確定的類型  //map 用來遍歷每一個購物車項目 c，並建立一個新的物件陣列。
        cart_id: c.cart_id,
        product_id: c.product_id,
        product_name: c.products.name,
        price: c.products.price,
        quantity: c.quantity,
      }));
      setCart(items);
    }
  };

  // 更新商品數量
  const updateQuantity = async (cartId: string, qty: number) => {
    if (qty <= 0) return;// 數量不能小於等於 0
    await supabase.from('cart').update({ quantity: qty }).eq('cart_id', cartId);
    fetchCart();
  };

  // 移除購物車商品
  const removeItem = async (cartId: string) => {
    await supabase.from('cart').delete().eq('cart_id', cartId);
    fetchCart();// 刪除後重新撈取購物車內容
  };

  // 計算總金額
  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);// sum 是累加器，初始值為 0，每次迭代會把當前商品的總價（單價 × 數量）加到 sum 上。//reduce 是陣列的累加函式，用來計算購物車中所有商品的總金額。

  // 結帳功能：呼叫 /api/orders 建立訂單
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('購物車是空的');
      return;
    }

    setLoading(true);
    try {
      // 取得 access token，作為 API 授權
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;// 取得目前使用者的存取權杖
      if (!accessToken) {
        alert('請先登入');
        setLoading(false);
        return;
      }
      // 呼叫後端 API 建立訂單
      const response = await fetch('/api/orders', {// 呼叫建立訂單的 API //response 是 API 回傳的回應物件
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',// 設定請求內容為 JSON
          'Authorization': `Bearer ${accessToken}`// 帶上授權頭
        },
      });

      const data = await response.json();// 解析回應 JSON

      if (response.ok) {
        // 訂單建立成功，顯示訊息並導向訂單明細頁
        alert(`訂單建立成功！訂單編號：${data.order_id}`);
        setCart([]); // 清空前端購物車顯示
        router.push(`/orders/${data.order_id}`); // 導向訂單明細頁
      } else {
        alert('結帳失敗：' + data.error);
      }
    } catch (error: any) {
      alert('結帳失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // UI：顯示購物車內容與操作
  return (
    <Box sx={{ width: 350, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>我的購物車</Typography>
      {cart.length === 0 ? (
        <Typography>購物車目前沒有商品</Typography>
      ) : (
        <Box>
          {/* 列出每個商品，可調整數量、刪除 */}
          {cart.map((item) => (//遍歷購物車陣列，顯示每個商品
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
          {/* 顯示總金額與結帳按鈕 */}
          <Typography variant="h6" sx={{ mt: 2 }}>總金額: NT$ {total}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            fullWidth 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '結帳'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
