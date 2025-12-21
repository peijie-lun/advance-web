'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Chip, CircularProgress, Button, Divider, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Receipt as ReceiptIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  order_item_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export default function OrderDetailPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    if (authLoading) return; // 還在載入身分時不做事
    if (user && orderId) {
      fetchOrderDetail();
    }
  }, [user, authLoading, orderId]);

  const fetchOrderDetail = async () => {
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        alert('未登入');
        setLoading(false);
        router.push('/orders');
        return;
      }
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data.order);
        setItems(data.items || []);
      } else {
        alert('載入訂單失敗：' + data.error);
        router.push('/orders');
      }
    } catch (error) {
      console.error('載入訂單失敗:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'shipped': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待付款';
      case 'paid': return '已付款';
      case 'shipped': return '已出貨';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  // 管理者更新訂單狀態
  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        alert('訂單狀態已更新');
      } else {
        alert('更新失敗：' + data.error);
      }
    } catch (error: any) {
      alert('更新失敗：' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // 使用者模擬付款
  const handlePayment = async () => {
    if (!order) return;
    
    const confirmPay = confirm(`確認要付款 NT$ ${order.total_amount} 嗎？`);
    if (!confirmPay) return;
    
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        alert('✅ 付款成功！訂單狀態已更新為「已付款」');
        // 重新載入訂單明細
        await fetchOrderDetail();
      } else {
        alert('付款失敗：' + data.error);
      }
    } catch (error: any) {
      alert('付款失敗：' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>訂單不存在</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', py: 4 }}>
      <Container maxWidth="md">
        {/* 返回按鈕 */}
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/orders')}
          sx={{ mb: 3 }}
        >
          返回訂單列表
        </Button>

        {/* 訂單資訊 */}
        <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ReceiptIcon sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                訂單 #{order.order_id.slice(0, 8)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                訂單時間：{new Date(order.created_at).toLocaleString('zh-TW')}
              </Typography>
            </Box>
            <Chip 
              label={getStatusText(order.status)} 
              color={getStatusColor(order.status)} 
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 管理者：修改訂單狀態 */}
          {role === 'admin' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                管理訂單
              </Typography>
              <FormControl fullWidth>
                <InputLabel>訂單狀態</InputLabel>
                <Select
                  value={order.status}
                  label="訂單狀態"
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                >
                  <MenuItem value="pending">待付款</MenuItem>
                  <MenuItem value="paid">已付款</MenuItem>
                  <MenuItem value="shipped">已出貨</MenuItem>
                  <MenuItem value="completed">已完成</MenuItem>
                  <MenuItem value="cancelled">已取消</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* 訂單項目 */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            訂單明細
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>商品名稱</TableCell>
                <TableCell align="right">單價</TableCell>
                <TableCell align="right">數量</TableCell>
                <TableCell align="right">小計</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.order_item_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell align="right">NT$ {item.price}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">NT$ {item.price * item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 3 }} />

          {/* 總金額 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              總金額
            </Typography>
            <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 700 }}>
              NT$ {order.total_amount}
            </Typography>
          </Box>

          {/* 付款按鈕（僅待付款狀態顯示） */}
          {order.status === 'pending' && role === 'user' && (
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 3 }}
              onClick={handlePayment}
              disabled={updating}
            >
              {updating ? '處理中...' : '💳 立即付款'}
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
