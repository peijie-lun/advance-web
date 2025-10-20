'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { grey, indigo, teal } from '@mui/material/colors';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';

type Order = {
  id: string;
  item: string;
  amount: number;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD001', item: 'iPad', amount: 20000 },
    { id: 'ORD002', item: 'iPhone 8', amount: 20000 },
    { id: 'ORD003', item: 'iPhone X', amount: 30000 },
  ]);

  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAddOrder() {
    setError(null);
    if (!id.trim() || !item.trim()) {
      setError('請輸入訂單編號與商品名稱');
      return;
    }
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('金額需為大於 0 的數字');
      return;
    }
    const newOrder: Order = { id: id.trim(), item: item.trim(), amount: amt };
    setOrders((prev) => [newOrder, ...prev]);
    setId('');
    setItem('');
    setAmount('');
    setOpen(false);
  }

  return (
    <Container sx={{ py: 6, position: 'relative' }}>
      {/* 標題區塊（黑色背景） */}
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

      {/* 訂單列表 */}
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} md={6} lg={4} key={order.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 4,
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
                    訂單編號：{order.id}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ color: indigo[800], fontWeight: 500, mb: 1 }}
                >
                  商品名稱：{order.item}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: grey[600], fontWeight: 500 }}
                >
                  金額：<strong>NT$ {order.amount.toLocaleString()}</strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 32, right: 32, bgcolor: teal[500] }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Dialog 表單 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>新增訂單</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="訂單編號"
              value={id}
              onChange={(e) => setId(e.target.value)}
              fullWidth
              variant="outlined"
            />
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
    </Container>
  );
}
``