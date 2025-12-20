'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // 允許訪問的角色
  redirectTo?: string; // 無權限時重定向的路徑
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 如果沒有登入，重定向到登入頁
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // 如果有角色限制，且用戶角色不在允許列表中
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        router.push('/'); // 重定向到首頁或顯示無權限頁面
      }
    }
  }, [user, role, loading, router, allowedRoles, redirectTo]);

  // 載入中
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          驗證身分中...
        </Typography>
      </Box>
    );
  }

  // 未登入或無權限
  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    return null; // 不顯示內容，等待重定向
  }

  return <>{children}</>;
}
