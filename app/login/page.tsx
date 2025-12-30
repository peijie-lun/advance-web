'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // 確保你的路徑正確
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
  Avatar,
  Link,
  Stack,
  Fade,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('請輸入 Email 與密碼');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert('登入失敗: ' + error.message);
      setLoading(false);
    } else {
      // 登入成功後稍微延遲跳轉，讓使用者感覺順暢
      setTimeout(() => {
        router.push('/'); 
      }, 500);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', // 與訂單頁面一致的背景
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Fade in={true} timeout={800}>
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)', // 柔和的陰影
              border: '1px solid rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* 🔒 頂部圖示 */}
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>

            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#334155' }}>
              歡迎回來
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              請登入以管理您的訂單
            </Typography>

            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  id="email"
                  label="Email 地址"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                    bgcolor: 'white',
                  }}
                />
                
                <TextField
                  fullWidth
                  name="password"
                  label="密碼"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                    bgcolor: 'white',
                  }}
                />
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                startIcon={!loading && <LoginIcon />}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  },
                }}
              >
                {loading ? '登入中...' : '登入'}
              </Button>
              
              {/* 底部連結 (選用) */}
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link href="#" variant="body2" sx={{ color: '#64748b', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  忘記密碼？
                </Link>
              </Box>
            </Box>
          </Paper>
          
          <Typography variant="caption" display="block" align="center" sx={{ mt: 4, color: '#94a3b8' }}>
            © {new Date().getFullYear()} Order Management System
          </Typography>
        </Container>
      </Fade>
    </Box>
  );
}