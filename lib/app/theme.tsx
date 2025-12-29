// app/theme.tsx
import { createTheme, ThemeOptions } from "@mui/material/styles";
// 引入 Material UI 的灰色板
import { grey } from '@mui/material/colors'; 

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#5f8bb9" }, // 主色：藍色
    // 輔色變更為灰色
    secondary: { main: grey[700] }, 
  },
};

export const theme = createTheme(themeOptions);