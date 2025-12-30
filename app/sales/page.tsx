'use client'; // Next.js 前端元件（Client Component）宣告
//「銷售訂單列表頁」，主要功能是顯示所有訂單的資訊（僅 admin 可看）
// MUI 元件
import { Box, Container, Card, CardContent, Typography, Grid } from '@mui/material';
// MUI 顏色
import { blue, grey, indigo, teal } from '@mui/material/colors';
// 訂單圖示
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
// 權限保護元件
import ProtectedRoute from '@/components/ProtectedRoute';

// 銷售訂單列表頁主元件
export default function OrderList() {
  // 假資料：訂單列表
  const orders = [
    { id: 'ORD001', item: 'iPad', amount: 20000 },
    { id: 'ORD002', item: 'iPhone 8', amount: 20000 },
    { id: 'ORD003', item: 'iPhone X', amount: 30000 },
  ];

  // UI 結構
  return (
    // 只有 admin 身份才能瀏覽
    <ProtectedRoute allowedRoles={['admin']}>
      <Container sx={{ py: 6 }}>
        {/* 頁首區塊 */}
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

        {/* 訂單卡片列表 */}
        <Grid container spacing={3}>
          {orders.map((order) => (// 迭代訂單資料產生卡片
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
                  {/* 訂單編號與圖示 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShoppingBagIcon sx={{ color: teal[600], mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      訂單編號：{order.id}
                    </Typography>
                  </Box>

                  {/* 商品名稱 */}
                  <Typography
                    variant="body1"
                    sx={{ color: indigo[800], fontWeight: 500, mb: 1 }}
                  >
                    商品名稱：{order.item}
                  </Typography>

                  {/* 金額 */}
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
