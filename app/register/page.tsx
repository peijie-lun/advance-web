'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    // 1. 建立帳號
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert('註冊失敗: ' + authError.message);
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
        alert('註冊成功！');
        router.push('/');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>註冊</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="密碼" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField label="使用者名稱" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField label="全名" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Button variant="contained" onClick={handleRegister}>送出</Button>
      </Box>
    </Container>
  );
}