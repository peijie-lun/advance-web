'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !username) {
      alert('請填寫所有必填欄位');
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert('註冊失敗: ' + authError.message);
      setLoading(false);
      return;
    }

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
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
      }}
    >
      {/* 🔙 左上角返回按鈕 */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            px: 2,
            fontWeight: 600,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(6px)',
            borderColor: '#cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            '&:hover': {
              background: 'rgba(241,245,249,0.8)',
              borderColor: '#94a3b8',
            },
          }}
        >
          返回
        </Button>
      </Box>

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
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'secondary.main',
                width: 56,
                height: 56,
                boxShadow: '0 4px 10px rgba(236, 72, 153, 0.3)',
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

            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              <Stack spacing={2.5}>
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
                  background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
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

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  已經有帳號了嗎？{' '}
                  <Link
                    component="a"
                    href="/login"
                    variant="body2"
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
