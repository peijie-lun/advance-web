// components/OrderHeader.tsx
import React from 'react';
import { Paper, Stack, Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { ShoppingBag as ShoppingBagIcon, Person as PersonIcon, Logout as LogoutIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type OrderHeaderProps = {
  user: User | null;
  onLogout: () => void;
};

export default function OrderHeader({ user, onLogout }: OrderHeaderProps) {
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

        {/* 👉 新增：個人資料按鈕 */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AccountCircleIcon />}
          onClick={() => router.push('/profile')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          個人資料
        </Button>

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
