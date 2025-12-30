'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useTheme } from '@mui/material/styles';

export default function HomeFeatureCard({//接收一個物件參數（props），包含三個欄位
  label,
  href,
  onNavigate,
}: {
  label: string;
  href: string;
  onNavigate: (href: string) => void;
}) {
  const theme = useTheme();

  const AccentColor = '#5f8bb9';
  const BackgroundBlur = 'rgba(255,255,255,0.75)';
  const TextColor = '#1e293b';

  return (
    <Card
      sx={{
        borderRadius: 18,
        background: BackgroundBlur,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.45)',
        color: TextColor,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',

        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(95,139,185,0.18)',
        },
      }}
      onClick={() => onNavigate(href)}//整張卡片都能點擊 // 點擊卡片時會呼叫 onNavigate 函式，並傳入 href 作為參數
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
          py: 3,
          px: 3.5,
        }}
      >
        {/* 🔵 Left: Icon + Label */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          {/* 圖標光暈圓形背景 */}
          <Box
            sx={{
              color: AccentColor,
              bgcolor: 'rgba(95,139,185,0.12)',
              borderRadius: '50%',
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 10px rgba(95,139,185,0.2)',
              transition: '0.3s',
              '&:hover': {
                boxShadow: 'inset 0 0 18px rgba(95,139,185,0.35)',
              },
            }}
          >
            <ShoppingBagIcon sx={{ fontSize: 30 }} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: TextColor,
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </Typography>
        </Box>

        {/* 🔵 Right: CTA Button */}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={(e) => {// 點擊按鈕時的事件處理函式
            e.stopPropagation();// 阻止事件冒泡，避免觸發 Card 的 onClick
            onNavigate(href);
          }}
          sx={{
            borderRadius: 20,
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            py: 1.2,
            fontSize: '1rem',
            bgcolor: AccentColor,
            color: '#fff',
            boxShadow: '0 6px 14px rgba(95,139,185,0.35)',
            transition: 'all 0.25s ease-out',

            '&:hover': {
              bgcolor: '#4a7593',
              boxShadow: '0 8px 20px rgba(95,139,185,0.45)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          前往
        </Button>
      </CardContent>
    </Card>
  );
}
