// components/OrderHeader.tsx
//訂單列表頁的頂部導覽列
import React from 'react';
import { Paper, Stack, Box, Typography, Chip, Avatar, Button, IconButton, Badge, Drawer } from '@mui/material';
import { ShoppingBag as ShoppingBagIcon, Person as PersonIcon, Logout as LogoutIcon, AccountCircle as AccountCircleIcon, ShoppingCart } from '@mui/icons-material';
import CartDrawer from '../../../order/orderlist/components/CartDrawer';
// 移除 supabase client，僅由父層控制
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type OrderHeaderProps = {
  user: User | null;
  onLogout: () => void;// 登出處理函式 // 父元件傳入的函式，用於處理使用者登出操作。 
};

// OrderHeader 元件：訂單列表頁的頂部導覽列
export default function OrderHeader({ user, onLogout }: OrderHeaderProps) {
  // 控制購物車抽屜開關
  const [cartOpen, setCartOpen] = React.useState(false);
  // 購物車商品數量（可擴充，這裡預設 0）
  const [cartCount, setCartCount] = React.useState(0);
  // 當前登入使用者 id
  const [userId, setUserId] = React.useState<string | null>(null);
  // 當 user 變動時，更新 userId
  React.useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);
  const router = useRouter();

  return (
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
      {/* 左側：LOGO 與標題 */}
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
      {/* 右側：購物車、用戶資訊、主頁、登出按鈕 */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* 購物車按鈕，點擊會開啟 CartDrawer */}
        <IconButton color="primary" sx={{ ml: 1 }} onClick={() => setCartOpen(true)}>
          <Badge badgeContent={cartCount} color="error" max={99}>
            <ShoppingCart />
          </Badge>
        </IconButton>
        {/* 購物車抽屜元件 */}
        <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400, md: 450 } } }}>
          <CartDrawer userId={userId} onClose={() => setCartOpen(false)} />
        </Drawer>
        {/* 顯示用戶名稱，點擊可前往個人頁 */}
        {user && (
          <Chip
            avatar={<Avatar sx={{ bgcolor: '#eff6ff', color: 'primary.main' }}><PersonIcon /></Avatar>}
            label={user.email?.split('@')[0]}
            onClick={() => router.push('/profile')}// 前往個人頁
            sx={{
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              fontWeight: 600,
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        )}
        {/* 主頁按鈕 */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AccountCircleIcon />}
          onClick={() => router.push('/')}// 前往主頁
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          主頁
        </Button>
        {/* 登出按鈕 */}
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          登出
        </Button>
      </Stack>
    </Paper>
  );
}
