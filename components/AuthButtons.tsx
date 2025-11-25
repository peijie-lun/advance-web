'use client';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
      <Button variant="outlined" sx={{ borderRadius: 2 }} onClick={() => router.push('/login')}>
        登入
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2 }}
        onClick={() => router.push('/register')}
      >
        註冊
      </Button>
    </Box>
  );
}
