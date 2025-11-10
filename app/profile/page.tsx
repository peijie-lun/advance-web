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
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            email: user.email,
            username: '',
            full_name: '',
            avatar_url: '',
            website: '',
          },
        ]);
        if (insertError) console.error(insertError);
      } else if (data) {
        setProfile(data);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  async function handleSave() {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
      })
      .eq('id', profile.id);

    if (error) alert('儲存失敗：' + error.message);
    else alert('已更新個人資料 ✅');
  }

  if (loading) return <p>載入中...</p>;

  return (
    <Container sx={{ py: 6, maxWidth: 600 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* 頭像區塊 */}
        <Stack alignItems="center" spacing={1} mb={3}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: '#e0f7fa',
              fontSize: 32,
              border: '4px solid #4caf50',
            }}
            src={profile?.avatar_url || ''}
          >
            {profile?.email?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {profile?.email}
          </Typography>
        </Stack>

        {/* 標題 */}
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          align="center"
          color="primary"
        >
          個人資料設定
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={4}
          textAlign="center"
        >
          管理您的帳號資訊與個人資料
        </Typography>

        {/* 表單輸入 */}
        <Stack spacing={2} alignItems="center">
          {[
            { label: '用戶名稱', key: 'username' },
            { label: '全名', key: 'full_name' },
            { label: '頭像 URL', key: 'avatar_url' },
            { label: '個人網站', key: 'website' },
          ].map(({ label, key }) => (
            <TextField
              key={key}
              label={label}
              value={profile?.[key as keyof Profile] || ''}
              onChange={(e) =>
                setProfile((p) => p && { ...p, [key]: e.target.value })
              }
              size="small"
              sx={{
                width: '85%',
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4caf50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />
          ))}
        </Stack>

        {/* 按鈕區 */}
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
            color="inherit"
            onClick={() => router.push('/order/orderlist')}

            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
            }}
          >
            返回首頁
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 4,
              fontWeight: 600,
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            儲存變更
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}