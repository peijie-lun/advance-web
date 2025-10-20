'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
} from '@mui/material';
import { grey, indigo, teal } from '@mui/material/colors';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';

export default function VendorList() {
  const [vendors, setVendors] = useState([
    { id: 'VEN001', name: '華碩電腦股份有限公司', contact: '02-2894-3447', category: '電腦硬體' },
    { id: 'VEN002', name: '宏碁股份有限公司', contact: '02-8691-3000', category: '電腦設備' },
    { id: 'VEN003', name: '聯發科技股份有限公司', contact: '03-567-0766', category: '晶片供應' },
  ]);

  const categories = ['電腦硬體', '電腦設備', '晶片供應'];

  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  // 處理電話格式自動加 "-" 並限制長度
  const handleContactChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 僅保留數字

    // 加上 - 格式
    if (value.length > 2 && value.length <= 6) {
      value = value.replace(/(\d{2})(\d+)/, '$1-$2');
    } else if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
    }

    // 限制最長長度為 12（包含 -）
    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    setContact(value);
  };

  const handleAddVendor = () => {
    if (!id || !name || !contact || !category) {
      setError('請填寫所有欄位');
      return;
    }
    const newVendor = { id, name, contact, category };
    setVendors([...vendors, newVendor]);
    setId('');
    setName('');
    setContact('');
    setCategory('');
    setError('');
    setOpen(false);
  };

  return (
    <Container sx={{ py: 6 }}>
      {/* 頁面標題 */}
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

      {/* 廠商卡片 */}
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

      {/* ➕ 浮動新增按鈕 */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 32, right: 32, bgcolor: teal[500] }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 🧾 Dialog：新增廠商表單 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>新增廠商</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="廠商編號"
              value={id}
              onChange={(e) => setId(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="廠商名稱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="聯絡電話"
              value={contact}
              onChange={handleContactChange}
              fullWidth
              variant="outlined"
              placeholder="例：02-1234-5678"
              inputProps={{ maxLength: 12 }}
            />
            <TextField
              select
              label="類別"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
              variant="outlined"
            >
              {categories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAddVendor}>
            新增
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
