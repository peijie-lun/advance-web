'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Container, Box, Button, Typography, Card, CardContent } from '@mui/material';
import { green, grey } from '@mui/material/colors';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const links = [
  { href: '/order/orderlist', label: '訂單列表', icon: <ShoppingBagIcon /> },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkSession();
  }, []);

  const handleNavigate = (href: string) => {
    if (!isLoggedIn) {
      alert('請先登入才能查看訂單列表');
      router.push('/login');
    } else {
      router.push(href);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: green[50],
        py: 8,
      }}
    >
      {/* 標題 */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: green[800], mb: 1 }}>
          🌱 歡迎回來！
        </Typography>
        <Typography variant="body1" sx={{ color: grey[700] }}>
          選擇功能開始使用吧
        </Typography>
      </Box>

      {/* 功能卡片 */}
      {links.map((link) => (
        <Card
          key={link.href}
          sx={{
            width: '100%',
            borderRadius: 3,
            mb: 2,
            boxShadow: 4,
            background: `linear-gradient(135deg, ${green[100]}, ${green[50]})`,
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 8,
            },
          }}
        >
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ color: green[700], mr: 1 }}>{link.icon}</Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: green[900] }}>
                {link.label}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => handleNavigate(link.href)}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: green[600],
                '&:hover': { bgcolor: green[700] },
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              前往
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* 登入與註冊按鈕 */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={() => router.push('/login')} sx={{ borderRadius: 2 }}>
          登入
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/register')}
          sx={{ bgcolor: green[600], '&:hover': { bgcolor: green[700] }, borderRadius: 2 }}
        >
          註冊
        </Button>
      </Box>

      {/* 底部 */}
      <Typography variant="body2" sx={{ color: grey[500], mt: 4 }}>
        © 2025 MyApp. All rights reserved.
      </Typography>
    </Container>
  );
}