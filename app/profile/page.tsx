'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Avatar,
  Paper,
  Divider,
  CircularProgress, // 新增:用於 Loading 狀態
  Snackbar,         // 新增:用於提示
  Alert,            // 新增:用於提示
  AlertColor,
  IconButton,       // 新增:用於頭像編輯按鈕
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; // 新增:頭像編輯圖示
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  website: string;
  email: string;
};

function ProfilePage() {
  const router = useRouter();
  const { user, role } = useAuth(); // 使用 useAuth 獲取用戶資訊
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // 新增:儲存中的狀態
  
  // Snackbar 提示狀態
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

  // 關閉 Snackbar
  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // 顯示 Snackbar 提示
  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // === 1. Fetch Profile 邏輯 ===
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return; // 如果沒有用戶，由 ProtectedRoute 處理重定向
      
      setLoading(true);
      const userEmail = user.email || 'N/A'; // 確保 email 不為空

      // 嘗試從 profiles table 獲取資料
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // 資料庫無資料，創建預設資料
        const newProfileData = {
          id: user.id,
          email: userEmail,
          username: '',
          full_name: '',
          avatar_url: '',
          website: '',
        };
        const { data: insertData, error: insertError } = await supabase.from('profiles').insert([newProfileData]).select().single();
        
        if (insertError) {
            showSnackbar('初始化個人資料失敗: ' + insertError.message, 'error');
        } else {
             setProfile(insertData);
             showSnackbar('已創建預設個人資料', 'info');
        }
      } else if (data) {
        // 成功獲取資料
        setProfile(data);
      } else if (error) {
         showSnackbar('載入個人資料失敗: ' + error.message, 'error');
      }

      setLoading(false);
    }
    fetchProfile();
  }, [user]); // 改為依賴 user

  // === 2. 儲存變更邏輯 ===
  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    
    // 簡單的前端驗證：檢查 username 是否為空
    if (!profile.username || profile.username.trim() === '') {
        showSnackbar('用戶名稱不能為空。', 'warning');
        setIsSaving(false);
        return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
      })
      .eq('id', profile.id);

    if (error) {
      showSnackbar('儲存失敗：' + error.message, 'error');
    } else {
      showSnackbar('個人資料已成功更新！', 'success');
    }
    setIsSaving(false);
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          載入中...
        </Typography>
      </Box>
    );
  }
  
  // 設置一個默認的全名或用戶名首字母作為 Avatar 的 fallback
  const fallbackText = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?';


  // === 3. UI 渲染 (美化部分) ===
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)', // 更柔和的背景
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10} // 提高陰影，更有質感
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'rgba(255,255,255,0.95)', // 幾乎不透明，但帶一點景深
            backdropFilter: 'blur(15px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)', // 更深邃的陰影
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            sx={{ color: '#1976d2', mb: 1.5 }}
          >
            我的帳戶 ⚙️
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={4}
            sx={{ opacity: 0.85 }}
          >
            管理您的個人資料和公開資訊
          </Typography>

          {/* Avatar + Email */}
          <Stack alignItems="center" spacing={1} mb={4}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile?.avatar_url || ''}
                alt={profile?.username}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#BBDEFB',
                  fontSize: 40,
                  border: '5px solid #1976d2', // 使用 primary color
                  boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                }}
              >
                {fallbackText}
              </Avatar>
              {/* 頭像編輯按鈕 (佔位，可連接上傳功能) */}
              <IconButton 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#1976d2',
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' }
                }}
                size="small"
                onClick={() => showSnackbar('頭像上傳功能尚未實作，請輸入 URL。', 'info')}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" fontWeight={600} color="text.primary" mt={1}>
              {profile?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              帳號 ID: {profile?.id.substring(0, 8)}...
            </Typography>
          </Stack>

          <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

          {/* Form */}
          <Stack spacing={3}>
            {[
              { label: '用戶名稱', key: 'username', helperText: '公開顯示的唯一名稱 (必填)' },
              { label: '全名', key: 'full_name', helperText: '您在現實生活中的名稱 (選填)' },
              { label: '頭像 URL', key: 'avatar_url', helperText: '可以直接連結到圖片的網址' },
              { label: '個人網站', key: 'website', helperText: '例如：https://yourdomain.com' },
            ].map(({ label, key, helperText }) => (
              <TextField
                key={key}
                label={label}
                value={profile?.[key as keyof Profile] || ''}
                onChange={(e) =>
                  setProfile((p) => p && { ...p, [key]: e.target.value })
                }
                fullWidth
                size="medium"
                helperText={helperText}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#90CAF9' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      boxShadow: '0 0 0 4px rgba(25,118,210,0.1)',
                    },
                  },
                }}
              />
            ))}
          </Stack>

          {/* Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 5,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => router.push('/order/orderlist')} // 保持您的原路徑
              disabled={isSaving}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                color: '#475569',
                borderColor: '#cbd5e1',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  borderColor: '#94a3b8',
                },
              }}
            >
              返回訂單列表
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={!isSaving && <SaveIcon />}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#1976d2',
                boxShadow: '0 6px 20px rgba(25,118,210,0.45)',
                transition: 'transform 0.2s',
                '&:hover': {
                  bgcolor: '#1565c0',
                  boxShadow: '0 10px 26px rgba(25,118,210,0.6)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isSaving ? <CircularProgress size={24} color="inherit" /> : '儲存變更'}
            </Button>
          </Box>
        </Paper>
      </Container>
      
      {/* 錯誤/成功提示元件 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// 包裝 ProfilePage 以使用權限保護
function ProtectedProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

export default ProtectedProfilePage;