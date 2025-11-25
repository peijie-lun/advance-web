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
  Avatar,
  Chip,
  Paper,
  Divider,
  InputAdornment,
  Zoom,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory2 as EmptyIcon,
} from '@mui/icons-material';
import { createClient, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ 對應 Supabase 資料表欄位
type Order = {
  order_id: string;
  custom_order_id: string | null; // 允許為 null
  product_name: string;
  amount: number;
  created_at?: string;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // ✅ 監聽登入狀態
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) router.push('/login');
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
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

  // ✅ 新增訂單
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

    // 過濾出格式為 ORDxxx 的 ID
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

  // ✅ 刪除訂單
  async function handleDelete(orderId: string) {
    if (!confirm('確定要刪除此訂單嗎？')) return;
    const { error } = await supabase.from('orders').delete().eq('order_id', orderId);

    if (error) {
      setError(`刪除失敗：${error.message}`);
    } else {
      setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
    }
  }

  // ✅ 編輯訂單
  function handleEdit(order: Order) {
    setEditOrder(order);
    setItem(order.product_name);
    setAmount(order.amount.toString());
    setEditOpen(true);
  }

  // ✅ 更新訂單
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
      resetForm();
    }
  }

  function resetForm() {
    setItem('');
    setAmount('');
    setOpen(false);
    setError(null);
  }

  // ✅ 登出功能
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
      {/* 🟢 頂部導航欄 (Glassmorphism) */}
      <Paper
        elevation={0}
        sx={{
          py: 2,
          px: 3,
          mb: 5,
          borderRadius: 0,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            }}
          >
            <ShoppingBagIcon sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              My Orders
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              管理您的購買清單
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {user && (
            <Chip
              avatar={<Avatar sx={{ bgcolor: '#eff6ff', color: 'primary.main' }}><PersonIcon /></Avatar>}
              label={user.email?.split('@')[0]}
              sx={{
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                fontWeight: 600,
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          )}
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            登出
          </Button>
        </Stack>
      </Paper>

      <Container maxWidth="lg">
        {/* 🟢 空狀態 (Empty State) */}
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
          /* 🟢 訂單卡片 Grid */
          <Grid container spacing={3}>
            {orders.map((order, index) => (
              <Grid item xs={12} sm={6} md={4} key={order.order_id}>
                <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0px 10px 30px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0px 20px 40px rgba(0,0,0,0.08)',
                        '& .action-buttons': { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    {/* 裝飾用彩色頂部條 */}
                    <Box
                      sx={{
                        height: 6,
                        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                      }}
                    />

                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        {/* 🛠️ 這裡修正了：如果沒有自訂編號，改顯示灰色 UUID */}
                        <Chip
                          label={order.custom_order_id ? order.custom_order_id : `#${order.order_id.substring(0, 8).toUpperCase()}`}
                          size="small"
                          sx={{
                            bgcolor: order.custom_order_id ? '#eff6ff' : '#f8fafc', // 藍底 vs 灰底
                            color: order.custom_order_id ? '#3b82f6' : '#94a3b8',   // 藍字 vs 灰字
                            fontWeight: 700,
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            letterSpacing: order.custom_order_id ? 'normal' : '-0.5px'
                          }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>
                        {order.product_name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Product Item
                      </Typography>

                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                        <Typography variant="caption" sx={{ mr: 0.5, color: '#64748b' }}>
                          Total
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #2563eb, #db2777)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          NT$ {order.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* 懸浮操作按鈕區域 */}
                    <Box
                      className="action-buttons"
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: 16,
                        display: 'flex',
                        gap: 1,
                        opacity: { xs: 1, md: 0 }, // 手機版總是顯示，電腦版懸浮顯示
                        transform: { xs: 'none', md: 'translateY(-10px)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(order)}
                        sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9', color: '#3b82f6' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(order.order_id)}
                        sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* 🟢 浮動按鈕 */}
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

      {/* 🟢 新增/編輯 Dialog 共用樣式 */}
      <Dialog
        open={open || editOpen}
        onClose={resetForm}
        PaperProps={{
          sx: { borderRadius: 4, width: '100%', maxWidth: 400, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 3 }}>
          {open ? '✨ 新增訂單' : '✏️ 編輯訂單'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="商品名稱"
              placeholder="例如：機械鍵盤"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start"><ShoppingBagIcon color="action" /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label="金額"
              placeholder="0"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoneyIcon color="action" /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            {error && (
              <Typography color="error" variant="body2" align="center" sx={{ bgcolor: '#fee2e2', p: 1, borderRadius: 2 }}>
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
          <Button onClick={resetForm} sx={{ color: '#94a3b8', borderRadius: 2, px: 3 }}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={open ? handleAddOrder : handleUpdateOrder}
            sx={{
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            確認儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}




//拆成 Component