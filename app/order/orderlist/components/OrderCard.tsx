// components/OrderCard.tsx
//顯示單一訂單卡片
import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Zoom from '@mui/material/Zoom';
import { EditOutlined as EditIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { Order } from '@/app/order/orderlist/types';

type OrderCardProps = {
  order: Order;
  index: number;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
};

// OrderCard 元件：顯示單一訂單卡片，含編輯/刪除操作
export default function OrderCard({ order, index, onEdit, onDelete }: OrderCardProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      {/* Zoom 動畫，index 決定延遲，讓卡片進場有階梯感 */}
      <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0px 10px 30px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0px 20px 40px rgba(0,0,0,0.08)',
              '& .action-buttons': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {/* 裝飾用彩色頂部條 */}
          <Box
            sx={{
              height: 6,
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
            }}
          />

          <CardContent sx={{ p: 3 }}>
            {/* 訂單編號（只顯示前 8 碼） */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={`#${order.order_id.substring(0, 8).toUpperCase()}`}
                size="small"
                sx={{
                  bgcolor: '#f8fafc',
                  color: '#94a3b8',
                  fontWeight: 700,
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  letterSpacing: '-0.5px',
                }}
              />
            </Box>

            {/* 商品名稱 */}
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>
              {order.product_name}
            </Typography>

            {/* 商品類型說明（可自訂） */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Product Item
            </Typography>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            {/* 顯示總金額 */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ mr: 0.5, color: '#64748b' }}>
                Total
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #2563eb, #db2777)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NT$ {order.amount.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>

          {/* 懸浮操作按鈕區域（編輯/刪除） */}
          <Box
            className="action-buttons"
            sx={{
              position: 'absolute',
              top: 20,
              right: 16,
              display: 'flex',
              gap: 1,
              opacity: { xs: 1, md: 0 },
              transform: { xs: 'none', md: 'translateY(-10px)' },
              transition: 'all 0.3s ease',
            }}
          >
            {/* 編輯按鈕，點擊會呼叫 onEdit 並傳入該訂單 */}
            <IconButton
              size="small"
              onClick={() => onEdit(order)}
              sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9', color: '#3b82f6' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {/* 刪除按鈕，點擊會呼叫 onDelete 並傳入訂單 id */}
            <IconButton
              size="small"
              onClick={() => onDelete(order.order_id)}
              sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      </Zoom>
    </Grid>
  );
}
