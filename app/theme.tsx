// app/theme.tsx
import { createTheme, ThemeOptions } from "@mui/material/styles";

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#5f8bb9" },
    secondary: { main: "#9c27b0" },
  },
};

export const theme = createTheme(themeOptions);