// app/theme.tsx
//定義全站的主題樣式設定
import { createTheme, ThemeOptions } from "@mui/material/styles";
// 引入 Material UI 的灰色板
import { grey } from '@mui/material/colors'; 
//會把這些主題設定包成一個 ThemeProvider 元件，讓整個應用程式都能使用這些主題樣式。
export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#5f8bb9" }, // 主色：藍色
    // 輔色變更為灰色
    secondary: { main: grey[700] }, 
  },
};

export const theme = createTheme(themeOptions);