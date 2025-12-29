'use client';

import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function HomeFooter() {               
  const theme = useTheme();

  return (
    <Typography
      variant="body2"
      sx={{ color: theme.palette.text.disabled, mt: 4 }}
    >
      © 2025 MyApp. All rights reserved.
    </Typography>
  );
}
