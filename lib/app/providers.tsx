"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {//children = 目前顯示的頁面 被這些 Provider 包住的 所有頁面與元件//不負責畫畫面 專門「包住全站」
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}