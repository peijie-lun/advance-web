'use client'; // Next.js 前端元件（Client Component）宣告
//登入頁面」，主要功能是讓用戶輸入 Email 和密碼登入。
// React hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Supabase 客戶端
import { supabase } from '@/lib/supabaseClient';
// MUI 元件
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
// MUI Icons
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

// 登入頁主元件
export default function LoginPage() {
  // 狀態管理：Email、密碼、載入狀態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 處理登入流程
  const handleLogin = async () => {
    // 檢查必填欄位
    if (!email || !password) {
      alert('請輸入 Email 與密碼');
      return;
    }

    setLoading(true);
    // 呼叫 Supabase 登入 API
    const { error } = await supabase.auth.signInWithPassword({ email, password });// 呼叫 Supabase 的 signInWithPassword 方法進行登入，傳入 email 和 password
    
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

  // UI 結構
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
      {/* 動畫進場 */}
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
            {/* 頂部登入圖示 */}
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

            {/* 標題與副標題 */}
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#334155' }}>
              歡迎回來
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              請登入以管理您的訂單
            </Typography>

            {/* 登入表單 */}
            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              <Stack spacing={2.5}>
                {/* Email 欄位 */}
                <TextField
                  fullWidth
                  id="email"
                  label="Email 地址"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}//更新 email 狀態 //e.target.value 使用者輸入的值
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
                {/* 密碼欄位 */}
                <TextField
                  fullWidth
                  name="password"
                  label="密碼"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}//更新 password 狀態 //e.target.value 使用者輸入的值
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

              {/* 登入按鈕 */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}// 點擊時觸發登入流程
                disabled={loading}// 載入中禁用按鈕
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

              {/* 底部連結（忘記密碼） */}
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link href="#" variant="body2" sx={{ color: '#64748b', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  忘記密碼？
                </Link>
              </Box>
            </Box>
          </Paper>

          {/* 頁腳版權宣告 */}
          <Typography variant="caption" display="block" align="center" sx={{ mt: 4, color: '#94a3b8' }}>
            © {new Date().getFullYear()} Order Management System
          </Typography>
        </Container>
      </Fade>
    </Box>
  );
}