'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Container,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Session, User } from '@supabase/supabase-js';

const links = [
  { href: '/order/orderlist', label: '訂單列表', icon: <ShoppingBagIcon /> },
];

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
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
        bgcolor: theme.palette.background.default,
        py: theme.spacing(8),
      }}
    >
      {/* 標題 */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
          🌱 歡迎回來！
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          {user ? `您好，${user.email}` : '選擇功能開始使用吧'}
        </Typography>
      </Box>

      {/* 功能卡片 */}
      <Stack spacing={2} sx={{ width: '100%' }}>
        {links.map((link) => (
          <Card
            key={link.href}
            sx={{
              borderRadius: 3,
              boxShadow: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}20)`,
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 8,
              },
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ color: theme.palette.primary.dark, mr: 1 }}>{link.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.contrastText }}>
                  {link.label}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNavigate(link.href)}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                前往
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* 登入與註冊按鈕 */}
      {!isLoggedIn && (
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => router.push('/login')} sx={{ borderRadius: 2 }}>
            登入
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/register')}
            sx={{ borderRadius: 2 }}
          >
            註冊
          </Button>
        </Box>
      )}

      {/* 底部 */}
      <Typography variant="body2" sx={{ color: theme.palette.text.disabled, mt: 4 }}>
        © 2025 MyApp. All rights reserved.
      </Typography>
    </Container>
  );
}