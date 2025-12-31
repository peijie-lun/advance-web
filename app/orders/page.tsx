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

  // 取得登入使用者、角色與載入狀態
  const { user, role, loading: authLoading } = useAuth();
  // 訂單列表狀態
  const [orders, setOrders] = useState<Order[]>([]);
  // 頁面載入狀態
  const [loading, setLoading] = useState(true);
  // 正在刪除的訂單 id
  const [deleting, setDeleting] = useState<string | null>(null);
  // 路由操作
  const router = useRouter();

  // 只要登入狀態或 user 變動就重新載入訂單列表
  useEffect(() => {
    if (!authLoading && user) {// 當不在載入中且有使用者時
      fetchOrders();
    }
  }, [user, authLoading]);

  // 取得訂單列表（向後端 API 請求）
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
      // 呼叫 API 取得訂單列表
      const response = await fetch('/api/orders', {// 發送 GET 請求到 /api/orders 端點
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []); // 設定訂單列表 // 如果沒有訂單則設為空陣列
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('載入訂單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 依訂單狀態回傳對應顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // 依訂單狀態回傳中文文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待付款';
      case 'paid': return '已付款';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  // 管理者刪除訂單
  const handleDeleteOrder = async (orderId: string, e: React.MouseEvent) => {// 點擊刪除按鈕
    e.stopPropagation(); // 避免觸發訂單詳情導航
    if (!confirm('確定要刪除此訂單嗎？此操作無法復原！')) return;
    setDeleting(orderId);
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      // 呼叫 API 刪除訂單
      const response = await fetch(`/api/orders/${orderId}`, {// 發送 DELETE 請求到 /api/orders/[orderId] 端點
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

  // 載入中顯示 loading spinner
  if (authLoading || loading) {// 如果身分驗證或訂單資料還在載入中
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 頁面主體渲染
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', py: 4 }}>
      <Container maxWidth="md">
        {/* 頁首：標題與返回首頁按鈕 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {role === 'admin' ? '所有訂單' : '我的訂單'}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => router.push('/')} sx={{ mb: 3 }}>
          返回首頁
        </Button>

        {/* 訂單列表區塊 */}
        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              目前沒有訂單
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => (//會把 orders 陣列中的每一個訂單物件 order，都渲染成一個 <Paper> 卡片。  
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
                {/* 單筆訂單卡片：標題、狀態、刪除按鈕、時間、金額 */}
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
                            onClick={(e) => handleDeleteOrder(order.order_id, e)}// 點擊刪除按鈕時呼叫 handleDeleteOrder
                            disabled={deleting === order.order_id}// 如果正在刪除此訂單則禁用按鈕
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

