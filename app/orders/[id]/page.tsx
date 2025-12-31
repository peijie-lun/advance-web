'use client';
//訂單詳情頁
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

// 訂單詳情頁面元件
export default function OrderDetailPage() {
  // 取得登入使用者、角色與載入狀態
  const { user, role, loading: authLoading } = useAuth();
  // 訂單主資料
  const [order, setOrder] = useState<Order | null>(null);//order 的型別是 Order 或 null，Order 是一個物件型別（包含訂單 id、用戶 id、金額、狀態、建立時間）
  // 訂單商品明細
  const [items, setItems] = useState<OrderItem[]>([]);
  // 頁面載入狀態
  const [loading, setLoading] = useState(true);
  // 狀態更新/付款時的處理狀態
  const [updating, setUpdating] = useState(false);
  // 路由操作
  const router = useRouter();
  // 取得網址參數
  const params = useParams();
  // 取得訂單 id
  const orderId = params.id as string;

  // 當使用者或訂單 id 變動時，載入訂單資料
  useEffect(() => {
    if (authLoading) return; // 還在載入身分時不做事
    if (user && orderId) {// 有使用者且有訂單 id 時
      fetchOrderDetail();// 取得訂單明細
    }
  }, [user, authLoading, orderId]);

  // 取得訂單明細（向後端 API 請求）
  const fetchOrderDetail = async () => {
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();// 從 supabase 客戶端取得目前的 session
      const accessToken = session?.access_token;// 從 session 中取得 access token
      if (!accessToken) {
        alert('未登入');
        setLoading(false);
        router.push('/orders');
        return;
      }
      // 呼叫 API 取得訂單資料
      const response = await fetch(`/api/orders/${orderId}`, {// 發送 GET 請求到 /api/orders/[orderId] 端點
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`// 在請求標頭中加入授權資訊
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data.order); // 設定訂單主資料
        setItems(data.items || []); // 設定訂單商品明細 //如果沒有 items，則設為空陣列
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

  // 依訂單狀態回傳對應顏色
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

  // 依訂單狀態回傳中文文字
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

  // 管理者：更新訂單狀態
  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;// 從 session 中取得 access token
      // PATCH 請求更新訂單狀態
      const response = await fetch(`/api/orders/${orderId}`, {// 發送 PATCH 請求到 /api/orders/[orderId] 端點
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`// 在請求標頭中加入授權資訊
        },
        body: JSON.stringify({ status: newStatus }),// 將新的狀態放在請求主體中
      });

      const data = await response.json();

      if (response.ok) {// 如果更新成功
        setOrder(data.order); // 更新本地訂單狀態
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

  // 使用者：模擬付款流程
  const handlePayment = async () => {
    if (!order) return;// 如果沒有訂單資料，直接返回
    // 彈窗確認付款
    const confirmPay = confirm(`確認要付款 NT$ ${order.total_amount} 嗎？`);
    if (!confirmPay) return;
    setUpdating(true);
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;// 從 session 中取得 access token
      // 呼叫付款 API
      const response = await fetch(`/api/orders/${orderId}/pay`, {// 發送 POST 請求到 /api/orders/[orderId]/pay 端點
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.order); // 更新訂單狀態
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

  // 載入中顯示 loading spinner
  if (authLoading || loading) {// 如果身分驗證或訂單資料還在載入中
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 找不到訂單時顯示
  if (!order) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>訂單不存在</Typography>
      </Box>
    );
  }

  // 頁面主體渲染
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

        {/* 訂單資訊區塊 */}
        <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          {/* 訂單標題與狀態顯示 */}
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
            {/* 狀態標籤 */}
            <Chip 
              label={getStatusText(order.status)} 
              color={getStatusColor(order.status)} 
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 管理者：可修改訂單狀態 */}
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
                  onChange={(e) => handleStatusChange(e.target.value)}// 當選擇改變時，呼叫 handleStatusChange 更新狀態
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

          {/* 訂單商品明細表格 */}
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
              {items.map((item) => (// 迭代每個訂單商品明細 //
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

          {/* 訂單總金額顯示 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              總金額
            </Typography>
            <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 700 }}>
              NT$ {order.total_amount}
            </Typography>
          </Box>

          {/* 付款按鈕（僅待付款狀態且為一般使用者時顯示） */}
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
