'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useTheme } from '@mui/material/styles';

export default function HomeFeatureCard({
  label,
  href,
  onNavigate,
}: {
  label: string;
  href: string;
  onNavigate: (href: string) => void;
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}20)`,
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        },
      }}
    >
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ color: theme.palette.primary.dark, mr: 1 }}>
            <ShoppingBagIcon />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.contrastText }}>
            {label}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => onNavigate(href)}
          sx={{ borderRadius: 2 }}
        >
          前往
        </Button>
      </CardContent>
    </Card>
  );
}
