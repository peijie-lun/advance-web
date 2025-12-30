'use client'; // Next.js 前端元件（Client Component）宣告


// //使用者輸入 Email、密碼、使用者名稱（可選全名）。
// 按下「註冊帳號」按鈕時，會先檢查必填欄位是否有填寫。
// 呼叫 Supabase 的註冊 API，建立新帳號（Email、密碼）。
// 註冊成功後，將使用者的 id、username、full_name 寫入 profiles 資料表。
// 根據註冊或資料儲存結果，顯示成功或失敗訊息。
// 註冊成功會自動導向首頁。

// React 及 Next.js hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Supabase 客戶端
import { supabase } from '@/lib/supabaseClient';
// MUI 元件
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
// MUI Icons
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// 註冊頁主元件
export default function RegisterPage() {
  // 表單欄位狀態
  const [username, setUsername] = useState(''); // 使用者名稱
  const [fullName, setFullName] = useState(''); // 全名
  const [email, setEmail] = useState(''); // Email
  const [password, setPassword] = useState(''); // 密碼
  const [loading, setLoading] = useState(false); // 載入狀態
  const router = useRouter(); // Next.js 路由

  // 處理註冊流程
  const handleRegister = async () => {
    // 檢查必填欄位
    if (!email || !password || !username) {// 必填欄位未填
      alert('請填寫所有必填欄位');
      return;
    }

    setLoading(true); // 顯示 loading 動畫

    // 呼叫 Supabase 註冊 API
    const { data: authData, error: authError } = await supabase.auth.signUp({//authData 包含使用者資訊  接收suopabase回傳的資料 取得註冊結果
      email,//傳入 email 和 password，請求建立新帳號。
      password,
    });

    // 註冊失敗處理
    if (authError) {
      alert('註冊失敗: ' + authError.message);
      setLoading(false);// 關閉 loading
      return;
    }

    // 註冊成功，寫入 profiles 資料表
    const userId = authData.user?.id;// 取得使用者 ID
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, username, full_name: fullName }]);

      if (profileError) {
        alert('儲存資料失敗: ' + profileError.message);
      } else {
        alert('註冊成功！歡迎加入');
        router.push('/'); // 註冊成功導向首頁
      }
    }
    setLoading(false); // 關閉 loading
  };
                            
  // UI 結構
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
      {/* 左上角返回首頁按鈕 */}
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

      {/* 主註冊表單區塊動畫進場 */}
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
            {/* 頁首註冊圖示 */}
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

            {/* 標題與副標題 */}
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#334155' }}>
              建立新帳號
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              加入我們，開始體驗完整功能
            </Typography>

            {/* 註冊表單 */}
            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              <Stack spacing={2.5}>
                {/* Email 欄位 */}
                <TextField
                  fullWidth
                  label="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}//更新 email 狀態 //e.target.value 使用者輸入的值
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, bgcolor: 'white' }}
                />

                {/* 密碼欄位 */}
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

                {/* 使用者名稱欄位 */}
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

                {/* 全名欄位（非必填） */}
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

              {/* 註冊按鈕 */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}// 點擊時觸發註冊流程
                disabled={loading}// 載入中時禁用按鈕
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
                {/* loading 狀態顯示進度圈 */}
                {loading ? <CircularProgress size={24} color="inherit" /> : '註冊帳號'}
              </Button>

              {/* 登入連結提示 */}
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
