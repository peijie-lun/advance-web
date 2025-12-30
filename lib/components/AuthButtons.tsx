'use client';
//這個元件負責顯示「登入」和「註冊」按鈕，並且有一些漂亮的樣式
import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mt: 4,
        justifyContent: 'center',
      }}
    >
      {/* ⬜ Outline 登入按鈕 - 高級淡灰 */}
      <Button
        variant="outlined"
        onClick={() => router.push('/login')}// 點擊後導向登入頁面
        sx={{
          borderRadius: 50,
          px: 3,
          py: 1.2,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          borderColor: 'rgba(95,139,185,0.35)',
          color: '#4a4a4a',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.28s ease',

          '&:hover': {
            borderColor: 'rgba(95,139,185,0.6)',
            backgroundColor: 'rgba(95,139,185,0.08)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        登入
      </Button>

      {/* 🔵 主按鈕（玻璃藍綠色） */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push('/register')}// 點擊後導向註冊頁面
        sx={{
          borderRadius: 50,
          px: 3.5,
          py: 1.2,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          background: '#5f8bb9',
          boxShadow: '0 6px 15px rgba(95,139,185,0.35)',
          transition: 'all 0.28s ease',

          '&:hover': {
            background: '#4a7593',
            boxShadow: '0 10px 20px rgba(95,139,185,0.45)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        註冊
      </Button>
    </Box>
  );
}


// 函式 = 做事情（計算、處理資料）

// 函式元件 = 特殊函式，回傳畫面，能放在 JSX <MyComp />

// 元件 = 可重用的畫面單位，可以是函式元件或類別元件