'use client';

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { User } from '@supabase/supabase-js';

export default function HomeHeader({ user }: { user: User | null }) {// 接收一個 user 物件，可能為 null 
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: 'center', mb: 5 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}
      >
        🌱 歡迎回來！
      </Typography>

      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
        {user ? `您好，${user.email}` : '選擇功能開始使用吧'}
      </Typography>
    </Box>
  );
}
