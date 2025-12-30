'use client'; // Next.js 前端元件（Client Component）宣告
// 進入頁面時，會自動從 Supabase profiles 資料表抓取目前登入者的個人資料，如果沒有資料就自動建立一筆預設資料。
// 用戶可以在表單中修改自己的用戶名稱、全名、頭像網址、個人網站。
// 點擊「儲存變更」按鈕時，會把修改後的資料更新到資料庫。
// 所有操作（如載入、儲存、錯誤）都會即時顯示提示訊息。
// 頁面有權限保護，只有登入者才能瀏覽和編輯。
// React hooks
import { useEffect, useState } from 'react';
// MUI 元件
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
  CircularProgress, // 用於 Loading 狀態
  Snackbar,         // 用於提示訊息
  Alert,            // 用於提示訊息
  AlertColor,
  IconButton,       // 用於頭像編輯按鈕
} from '@mui/material';
// Supabase 客戶端
import { createClient } from '@supabase/supabase-js';
// Next.js 路由
import { useRouter } from 'next/navigation';
// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; // 頭像編輯圖示
// 權限保護元件
import ProtectedRoute from '@/components/ProtectedRoute';
// 取得用戶資訊
import { useAuth } from '@/contexts/AuthContext';

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 個人資料型別
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
  const { user, role } = useAuth(); // 取得目前登入者資訊
  // 個人資料狀態
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // 載入狀態
  const [isSaving, setIsSaving] = useState(false); // 儲存中狀態
  // Snackbar 提示狀態
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

  // 關閉提示訊息
  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {// 點擊提示訊息外圍不關閉 //避免誤觸 
      return;
    }
    setSnackbarOpen(false);
  };

  // 顯示提示訊息
  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);// 'success' | 'error' | 'warning' | 'info'
    setSnackbarOpen(true);
  };

  // 1. 取得個人資料（進入頁面自動執行）
  useEffect(() => {
    async function fetchProfile() {// 從 Supabase 抓取個人資料
      if (!user) return; // 沒有登入者就不執行

      setLoading(true);
      const userEmail = user.email || 'N/A'; // 如果 email 是 null 或 undefined，就用 'N/A' 當作預設值。

      // 從 profiles 資料表抓取用戶資料
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)// 篩選目前登入者的資料 //根據 user.id 抓取資料
        .single();

      if (error && error.code === 'PGRST116') {
        // 沒有資料就自動建立一筆預設資料
        const newProfileData = {
          id: user.id,
          email: userEmail,
          username: '',
          full_name: '',
          avatar_url: '',
          website: '',
        };
        const { data: insertData, error: insertError } = await supabase.from('profiles').insert([newProfileData]).select().single(); //select()是回傳該筆資料
        if (insertError) {
          showSnackbar('初始化個人資料失敗: ' + insertError.message, 'error');
        } else {
          setProfile(insertData);
          showSnackbar('已創建預設個人資料', 'info');
        }
      } else if (data) {
        // 成功獲取資料
        setProfile(data);//設定 profile 狀態
      } else if (error) {
        showSnackbar('載入個人資料失敗: ' + error.message, 'error');
      }

      setLoading(false);
    }
    fetchProfile();// 呼叫抓取個人資料函式
  }, [user]); // 依賴 user // user 變更時重新執行

  // 2. 儲存個人資料（點擊儲存按鈕時執行）
  async function handleSave() {
    if (!profile) return;// 沒有資料就不執行
    setIsSaving(true);
    // 前端驗證：用戶名稱不能為空
    if (!profile.username || profile.username.trim() === '') {//trim() 去除空白 //確認用戶名稱不是空字串
      showSnackbar('用戶名稱不能為空。', 'warning');
      setIsSaving(false);
      return;
    }

    // 更新資料到 profiles 資料表
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,//根據 hook 狀態裡的 profile 物件來抓取欄位值
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
      })
      .eq('id', profile.id);

    if (error) {
      showSnackbar('儲存失敗：' + error.message, 'error');// 顯示錯誤提示
    } else {
      showSnackbar('個人資料已成功更新！', 'success');// 顯示成功提示
    }
    setIsSaving(false);
  }

  // 載入中顯示 loading 畫面
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

  // 設定頭像預設文字（全名/用戶名/Email 首字母）
//   取得 profile 的 full_name、username、email 其中一個的第一個字元（如果有的話），並轉成大寫，作為頭像的預設顯示文字。
// 優先順序是：full_name → username → email。
// 如果這三個都沒有，就顯示問號 '?'
  const fallbackText = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?';// 頭像預設文字


  // 3. UI 渲染（美化與互動）
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)', // 柔和背景
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10} // 陰影質感
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}
        >
          {/* 標題區塊 */}
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

          {/* 頭像與 Email 顯示 */}
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
                  border: '5px solid #1976d2',
                  boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                }}
              >
                {fallbackText}
              </Avatar>
              {/* 頭像編輯按鈕（目前僅顯示提示，未實作上傳） */}
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

          {/* 編輯表單欄位 */}
          <Stack spacing={3}>
            {/* 用戶名稱、全名、頭像 URL、個人網站欄位 */}
            {[
              { label: '用戶名稱', key: 'username', helperText: '公開顯示的唯一名稱 (必填)' },
              { label: '全名', key: 'full_name', helperText: '您在現實生活中的名稱 (選填)' },
              { label: '頭像 URL', key: 'avatar_url', helperText: '可以直接連結到圖片的網址' },
              { label: '個人網站', key: 'website', helperText: '例如：https://yourdomain.com' },
            ].map(({ label, key, helperText }) => (//map 迭代產生多個 TextField 元件
              <TextField
                key={key}
                label={label}
                value={profile?.[key as keyof Profile] || ''}// 動態取得 profile 物件的對應欄位值
                onChange={(e) =>
                  setProfile((p) => p && { ...p, [key]: e.target.value })// 更新對應欄位值
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

          {/* 操作按鈕區塊 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 5,
            }}
          >
            {/* 返回訂單列表按鈕 */}
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => router.push('/order/orderlist')}
              disabled={isSaving}// 儲存中禁用按鈕
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

            {/* 儲存變更按鈕 */}
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

// 權限保護包裝元件，只有登入者能瀏覽
function ProtectedProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

export default ProtectedProfilePage;