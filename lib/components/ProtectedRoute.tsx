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
  allowedRoles = [],//預設是空陣列，表示不限制角色
  redirectTo = '/login',//預設重定向到登入頁
}: ProtectedRouteProps) {

  const { user, role, loading } = useAuth();//從 AuthContext 拿到目前的使用者、角色和載入狀態
  const router = useRouter();

  useEffect(() => {
    if (!loading) {//確保載入完成後才進行檢查
      // 如果沒有登入，重定向到登入頁
      if (!user) {//如果沒有登入的使用者，就跳轉到登入頁
        router.push(redirectTo);//
        return;
      }

      // 如果有角色限制，且用戶角色不在允許列表中 
      //負責跳轉沒有權限的使用者
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        router.push('/'); // 重定向到首頁或顯示無權限頁面
      }
    }
  }, [user, role, loading, router, allowedRoles, redirectTo]);//當 user、role、loading、router、allowedRoles、redirectTo 其中一個改變時，就會重新執行這個 useEffect 裡的程式碼

  // 載入中UI
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

  // 未登入或無權限 //一個是負責「UI 隱藏」
  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    return null; // 不顯示內容，等待重定向
  }

  return <>{children}</>;
}

// ProtectedRoute 是 保護頁面元件

// 它會 檢查使用者是否登入

// 如果有 allowedRoles，也會檢查角色

// 驗證中 → 顯示載入畫面

// 驗證失敗 → 自動跳轉

// 驗證通過 → 顯示 children（真正頁面內容）

//元件就是 可重複使用的畫面或功能單位，用來組成完整的網頁或 App