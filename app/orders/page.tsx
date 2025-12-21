'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Chip, CircularProgress, Button, IconButton, Tooltip } from '@mui/material';
import { Receipt as ReceiptIcon, ShoppingBag as ShoppingBagIcon } from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        console.error('未登入');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('載入訂單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待付款';
      case 'paid': return '已付款';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  // 管理者刪除訂單
  const handleDeleteOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 避免觸發訂單詳情導航
    if (!confirm('確定要刪除此訂單嗎？此操作無法復原！')) return;
    
    setDeleting(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('訂單已刪除');
        fetchOrders(); // 重新載入訂單列表
      } else {
        alert('刪除失敗：' + data.error);
      }
    } catch (error: any) {
      alert('刪除失敗：' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', py: 4 }}>
      <Container maxWidth="md">
        {/* 頁首 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {role === 'admin' ? '所有訂單' : '我的訂單'}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => router.push('/')} sx={{ mb: 3 }}>
          返回首頁
        </Button>

        {/* 訂單列表 */}
        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              目前沒有訂單
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => (
              <Paper
                key={order.order_id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => router.push(`/orders/${order.order_id}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    訂單 #{order.order_id.slice(0, 8)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={getStatusText(order.status)} 
                      color={getStatusColor(order.status)} 
                      size="small"
                    />
                    {role === 'admin' && (
                      <Tooltip title="刪除訂單" arrow>
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={(e) => handleDeleteOrder(order.order_id, e)}
                            disabled={deleting === order.order_id}
                          >
                            {deleting === order.order_id ? <CircularProgress size={20} color="error" /> : <DeleteIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.created_at).toLocaleString('zh-TW')}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                    NT$ {order.total_amount}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
