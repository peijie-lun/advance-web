'use client';

import { useEffect, useState } from 'react';
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
import { createClient } from '@supabase/supabase-js';
import ProtectedRoute from '@/components/ProtectedRoute';

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VendorList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(''); // 自動生成的編號 VEN001...
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const categories = ['電腦硬體', '電腦設備', '晶片供應'];

  // ✅ 抓取 Supabase 資料
  useEffect(() => {
    async function fetchVendors() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error.message);
      } else {
        setVendors(data || []);
      }
    }
    fetchVendors();
  }, []);

  // ✅ 處理電話格式自動加 "-" 並限制長度
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // ✅ 新增廠商到 Supabase（含自動編號）
  const handleAddVendor = async () => {
    setError('');

    if (!name.trim() || !contact.trim() || !category.trim()) {
      setError('請填寫所有欄位');
      return;
    }

    // 1️⃣ 查詢目前最大 vendor_id
    const { data: existingVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('vendor_id');

    if (fetchError) {
      setError(`查詢廠商編號失敗：${fetchError.message}`);
      return;
    }

    const ids =
      existingVendors
        ?.map((v) => v.vendor_id)
        .filter((id) => /^VEN\d+$/.test(id)) || [];
    const maxNumber = Math.max(...ids.map((id) => parseInt(id.replace('VEN', ''))), 0);
    const nextVendorId = `VEN${(maxNumber + 1).toString().padStart(3, '0')}`;

    // 2️⃣ 插入新廠商
    const newVendor = {
      vendor_id: nextVendorId,
      vendor_name: name.trim(),
      phone: contact.trim(),
      category: category.trim(),
    };

    const { data, error: insertError } = await supabase
      .from('vendors')
      .insert([newVendor])
      .select();

    if (insertError) {
      setError(`新增失敗：${insertError.message}`);
    } else if (data && data.length > 0) {
      setVendors((prev) => [data[0], ...prev]);
      setId('');
      setName('');
      setContact('');
      setCategory('');
      setOpen(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
          <Grid item xs={12} md={6} lg={4} key={vendor.vendor_id}>
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
                    廠商編號：{vendor.vendor_id}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ color: indigo[800], fontWeight: 500, mb: 1 }}
                >
                  廠商名稱：{vendor.vendor_name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: grey[600], fontWeight: 500, mb: 0.5 }}
                >
                  聯絡電話：<strong>{vendor.phone}</strong>
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
    </ProtectedRoute>
  );
}
