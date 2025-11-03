'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  IconButton,
} from '@mui/material';
import { grey, indigo, teal } from '@mui/material/colors';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { createClient } from '@supabase/supabase-js';

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ 對應 Supabase 資料表欄位
type Order = {
  order_id: string;
  custom_order_id: string;
  product_name: string;
  amount: number;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

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

  async function handleAddOrder() {
    setError(null);
    if (!item.trim()) {
      setError('請輸入商品名稱');
      return;
    }
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('金額需為大於 0 的數字');
      return;
    }

    const { data: existingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('custom_order_id');

    if (fetchError) {
      setError(`查詢訂單編號失敗：${fetchError.message}`);
      return;
    }

    const ids = existingOrders
      .map((o) => o.custom_order_id)
      .filter((id) => /^ORD\d+$/.test(id));
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
      setItem('');
      setAmount('');
      setOpen(false);
    }
  }

  async function handleDelete(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) {
      console.error('刪除失敗：', error.message);
      setError(`刪除失敗：${error.message}`);
    } else {
      setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
    }
  }

  function handleEdit(order: Order) {
    setEditOrder(order);
    setItem(order.product_name);
    setAmount(order.amount.toString());
    setEditOpen(true);
  }

  async function handleUpdateOrder() {
    if (!editOrder) return;

    const amt = Number(amount);
    if (!item.trim()) {
      setError('請輸入商品名稱');
      return;
    }
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('金額需為大於 0 的數字');
      return;
    }

    const { data, error: updateError } = await supabase
      .from('orders')
      .update({
        product_name: item.trim(),
        amount: amt,
      })
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
      setEditOpen(false);
      setEditOrder(null);
      setItem('');
      setAmount('');
    }
  }

  return (
    <Container sx={{ py: 6, position: 'relative' }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          backgroundColor: grey[900],
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: grey[100] }}>
          📦 訂單列表
        </Typography>
        <Typography variant="body2" sx={{ color: grey[400] }}>
          查看您的購買紀錄與金額明細
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} md={6} lg={4} key={order.order_id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShoppingBagIcon sx={{ color: teal[600], mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    訂單編號：{order.custom_order_id}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ color: indigo[800], fontWeight: 500, mb: 1 }}
                >
                  商品名稱：{order.product_name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: grey[600], fontWeight: 500 }}
                >
                  金額：<strong>NT$ {order.amount.toLocaleString()}</strong>
                </Typography>
              </CardContent>

              {/* ✅ 修改與刪除 icon 放右下角，間距緊密 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.1,
                }}
              >
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEdit(order)}
                  sx={{ color: grey[600] }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(order.order_id)}
                  sx={{ color: grey[600] }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 32, right: 32, bgcolor: teal[500] }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 新增 Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>新增訂單</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="商品名稱"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="金額"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              variant="outlined"
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAddOrder}>
            新增
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編輯 Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>編輯訂單</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="商品名稱"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="金額"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              variant="outlined"
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleUpdateOrder}>
            更新
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
