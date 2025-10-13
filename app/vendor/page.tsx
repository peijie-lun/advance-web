'use client';

import { Box, Container, Card, CardContent, Typography, Grid } from '@mui/material';
import { blue, grey, indigo, teal } from '@mui/material/colors';
import BusinessIcon from '@mui/icons-material/Business';

export default function VendorList() {
  const vendors = [
    { id: 'VEN001', name: '華碩電腦股份有限公司', contact: '02-2894-3447', category: '電腦硬體' },
    { id: 'VEN002', name: '宏碁股份有限公司', contact: '02-8691-3000', category: '電腦設備' },
    { id: 'VEN003', name: '聯發科技股份有限公司', contact: '03-567-0766', category: '晶片供應' },
  ];

  return (
    <Container sx={{ py: 6 }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          background: `linear-gradient(135deg, ${indigo[100]}, ${teal[50]})`,
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: indigo[900] }}>
          🏢 廠商列表
        </Typography>
        <Typography variant="body2" sx={{ color: grey[700] }}>
          管理合作廠商資訊與聯絡方式
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {vendors.map((vendor) => (
          <Grid item xs={12} md={6} lg={4} key={vendor.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ color: teal[600], mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    廠商編號：{vendor.id}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ color: indigo[800], fontWeight: 500, mb: 1 }}
                >
                  廠商名稱：{vendor.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: grey[600], fontWeight: 500, mb: 0.5 }}
                >
                  聯絡電話：<strong>{vendor.contact}</strong>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: grey[600], fontWeight: 500 }}
                >
                  類別：<strong>{vendor.category}</strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}