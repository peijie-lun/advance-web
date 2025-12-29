'use client';
//銷售訂單列表頁」，主要功能是顯示所有訂單的摘要資訊

import { Box, Container, Card, CardContent, Typography, Grid } from '@mui/material';
import { blue, grey, indigo, teal } from '@mui/material/colors';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrderList() {
  const orders = [
    { id: 'ORD001', item: 'iPad', amount: 20000 },
    { id: 'ORD002', item: 'iPhone 8', amount: 20000 },
    { id: 'ORD003', item: 'iPhone X', amount: 30000 },
  ];

  return (
    // 使用 ProtectedRoute 元件保護此頁面，僅允許具有 'admin' 角色的使用者存取
    <ProtectedRoute allowedRoles={['admin']}>      
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
          📦 訂單列表
        </Typography>
        <Typography variant="body2" sx={{ color: grey[700] }}>
          查看您的購買紀錄與金額明細
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {orders.map((order) => (//對每個訂單 order 產生一個區塊。
          <Grid item xs={12} md={6} lg={4} key={order.id}>
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
                  <ShoppingBagIcon sx={{ color: teal[600], mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    訂單編號：{order.id}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ color: indigo[800], fontWeight: 500, mb: 1 }}
                >
                  商品名稱：{order.item}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: grey[600], fontWeight: 500 }}
                >
                  金額：<strong>NT$ {order.amount.toLocaleString()}</strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
    </ProtectedRoute>
  );
}
