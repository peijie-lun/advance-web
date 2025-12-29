'use client';
//購物車側邊欄（CartDrawer）的元件，主要功能是顯示、編輯、刪除購物車商品，以及結帳
import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CartDrawerProps {// 定義元件的屬性介面 
  userId: string | null;
  onClose: () => void; // 關閉購物車
}

interface CartItem {// 購物車中每一個商品的資料結構
  cart_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export default function CartDrawer({ userId, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {// 當 userId 改變時，載入購物車資料
    if (userId) fetchCart();
  }, [userId]);
//購物車資料操作
  const fetchCart = async () => {//從 Supabase 的 cart 資料表撈出目前使用者的購物車商品，並整理成前端需要的格式
    const { data, error } = await supabase
      .from('cart')
      .select('cart_id, product_id, quantity, products(product_id, name, price)')
      .eq('user_id', userId);
    if (!error && data) {//將撈出的資料轉換成 CartItem 陣列
      const items = (data as any[]).map((c) => ({
        cart_id: c.cart_id,
        product_id: c.product_id,
        product_name: c.products.name,
        price: c.products.price,
        quantity: c.quantity,
      }));
      setCart(items);//更新購物車狀態
    }
  };
//更新商品數量 //刪除商品 //計算總金額 //結帳

  const updateQuantity = async (cartId: string, qty: number) => {//更新 購物車中某個商品的數量
    if (qty <= 0) return;//數量不能小於等於 0 不會更新
    await supabase.from('cart').update({ quantity: qty }).eq('cart_id', cartId);//
    fetchCart();//更新後重新撈取購物車資料
  };

  const removeItem = async (cartId: string) => {//刪除 購物車中的某個商品 //cartId 參數
    await supabase.from('cart').delete().eq('cart_id', cartId);
    fetchCart();//刪除後重新撈取購物車資料
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);//計算購物車中所有商品的總金額
//reduce 是陣列的累加器函式，會把每個商品的「單價 × 數量」加總起來。

  // 結帳功能
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('購物車是空的');
      return;
    }

    setLoading(true);
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        alert('請先登入');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/orders', {//呼叫後端的建立訂單 API 發送 POST 請求到 /api/orders，帶上 access token 做身分驗證。
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      const data = await response.json();//解析回應資料

      if (response.ok) {
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

  return (//回傳 JSX（畫面描述）
    <Box sx={{ width: 350, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>我的購物車</Typography>
      {cart.length === 0 ? (
        <Typography>購物車目前沒有商品</Typography>
      ) : (
        <Box>
          {cart.map((item) => (//對每個商品 item 產生一個區塊。
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
