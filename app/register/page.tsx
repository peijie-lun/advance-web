'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
  Avatar,
  Stack,
  Fade,
  Link,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 新增 Loading 狀態
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !username) {
      alert('請填寫所有必填欄位');
      return;
    }

    setLoading(true);

    // 1. 建立帳號
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert('註冊失敗: ' + authError.message);
      setLoading(false);
      return;
    }

    // 2. 插入 profiles
    const userId = authData.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, username, full_name: fullName }]);

      if (profileError) {
        alert('儲存資料失敗: ' + profileError.message);
      } else {
        alert('註冊成功！歡迎加入');
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', // 統一背景色
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4, // 上下留白，避免手機版太擠
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
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* ✨ 頂部圖示 */}
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'secondary.main',
                width: 56,
                height: 56,
                boxShadow: '0 4px 10px rgba(236, 72, 153, 0.3)', // 粉色系陰影區別於登入
                background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
              }}
            >
              <PersonAddIcon fontSize="large" />
            </Avatar>

            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#334155' }}>
              建立新帳號
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              加入我們，開始體驗完整功能
            </Typography>

            {/* ✨ 表單區域 */}
            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              <Stack spacing={2.5}>
                
                {/* Email */}
                <TextField
                  fullWidth
                  label="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, bgcolor: 'white' }}
                />

                {/* 密碼 */}
                <TextField
                  fullWidth
                  label="設定密碼"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, bgcolor: 'white' }}
                />

                {/* 使用者名稱 */}
                <TextField
                  fullWidth
                  label="使用者名稱 (Username)"
                  placeholder="例如：user123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, bgcolor: 'white' }}
                />

                {/* 全名 (選填) */}
                <TextField
                  fullWidth
                  label="全名 (Full Name)"
                  placeholder="例如：王小明"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, bgcolor: 'white' }}
                />
              </Stack>

              {/* ✨ 送出按鈕 */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #ec4899, #8b5cf6)', // 紫粉色漸層
                  boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.39)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(45deg, #db2777, #7c3aed)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '註冊帳號'}
              </Button>

              {/* ✨ 底部連結 */}
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  已經有帳號了嗎？{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => router.push('/login')}
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    立即登入
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}