'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Fab, Typography } from '@mui/material';
import { Add as AddIcon, Inventory2 as EmptyIcon } from '@mui/icons-material';
import { createClient, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// 引入元件
import OrderHeader from './components/OrderHeader';
import OrderCard from './components/OrderCard';
import OrderDialog from './components/OrderDialog';
import { Order } from '@/app/order/orderlist/types';

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false); // 控制新增 Dialog
  const [editOpen, setEditOpen] = useState(false); // 控制編輯 Dialog
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // ✅ 監聽登入狀態
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) router.push('/login');
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      if (!session?.user) router.push('/login');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // ✅ 讀取訂單資料
  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error.message);
      } else {
        setOrders(data as Order[]);
      }
    }
    fetchOrders();
  }, []);

  // ✅ 新增訂單邏輯
  async function handleAddOrder() {
    setError(null);
    if (!item.trim()) return setError('請輸入商品名稱');
    
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) return setError('金額需為大於 0 的數字');

    const { data: existingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('custom_order_id');

    if (fetchError) return setError(`查詢訂單編號失敗：${fetchError.message}`);

    const ids = existingOrders
      .map((o) => o.custom_order_id)
      .filter((id): id is string => !!id && /^ORD\d+$/.test(id));
      
    const maxNumber = Math.max(...ids.map((id) => parseInt(id.replace('ORD', ''))), 0);
    const nextOrderId = `ORD${(maxNumber + 1).toString().padStart(3, '0')}`;

    const newOrder = {
      custom_order_id: nextOrderId,
      product_name: item.trim(),
      amount: amt,
    };

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert([newOrder])
      .select();

    if (insertError) {
      setError(`新增失敗：${insertError.message}`);
    } else if (data) {
      setOrders((prev) => [data[0] as Order, ...prev]);
      resetForm();
    }
  }

  // ✅ 刪除訂單邏輯
  async function handleDelete(orderId: string) {
    if (!confirm('確定要刪除此訂單嗎？')) return;
    const { error } = await supabase.from('orders').delete().eq('order_id', orderId);

    if (error) {
      setError(`刪除失敗：${error.message}`);
    } else {
      setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
    }
  }

  // ✅ 開啟編輯模式
  function handleEdit(order: Order) {
    setEditOrder(order);
    setItem(order.product_name);
    setAmount(order.amount.toString());
    setEditOpen(true);
  }

  // ✅ 更新訂單邏輯
  async function handleUpdateOrder() {
    if (!editOrder) return;

    const amt = Number(amount);
    if (!item.trim()) return setError('請輸入商品名稱');
    if (!amount || isNaN(amt) || amt <= 0) return setError('金額需為大於 0 的數字');

    const { data, error: updateError } = await supabase
      .from('orders')
      .update({ product_name: item.trim(), amount: amt })
      .eq('order_id', editOrder.order_id)
      .select();

    if (updateError) {
      setError(`更新失敗：${updateError.message}`);
    } else if (data) {
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === editOrder.order_id ? (data[0] as Order) : order
        )
      );
      resetForm();
    }
  }

  // 重置表單
  function resetForm() {
    setItem('');
    setAmount('');
    setOpen(false);
    setEditOpen(false);
    setEditOrder(null);
    setError(null);
  }

  // 登出
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)',
        pb: 8,
      }}
    >
      {/* 🔹 頂部元件 */}
      <OrderHeader user={user} onLogout={handleLogout} />

      <Container maxWidth="lg">
        {/* 🔹 空狀態 */}
        {orders.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              opacity: 0.7,
            }}
          >
            <EmptyIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              目前沒有任何訂單
            </Typography>
            <Typography variant="body2" color="text.disabled">
              點擊右下角的按鈕來新增第一筆消費！
            </Typography>
          </Box>
        ) : (
          /* 🔹 訂單列表 */
          <Grid container spacing={3}>
            {orders.map((order, index) => (
              <OrderCard
                key={order.order_id}
                order={order}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </Grid>
        )}
      </Container>

      {/* 🔹 浮動新增按鈕 */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
          '&:hover': { transform: 'scale(1.1)' },
          transition: 'transform 0.2s',
        }}
      >
        <AddIcon />
      </Fab>

      {/* 🔹 新增/編輯視窗 (共用元件) */}
      <OrderDialog
        open={open || editOpen}
        isEditMode={editOpen}
        item={item}
        setItem={setItem}
        amount={amount}
        setAmount={setAmount}
        error={error}
        onClose={resetForm}
        onSubmit={open ? handleAddOrder : handleUpdateOrder}
      />
    </Box>
  );
}