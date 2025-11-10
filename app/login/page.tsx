'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('登入失敗: ' + error.message);
    } else {
      alert('登入成功！');
      router.push('/order/orderlist'); // ✅ 登入後直接跳轉到訂單列表
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
          登入帳號
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="密碼"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            sx={{
              mt: 2,
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            登入
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}