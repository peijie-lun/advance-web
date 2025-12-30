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
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
} from '@mui/material';
import { grey, indigo, teal, red, amber } from '@mui/material/colors';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import CategoryIcon from '@mui/icons-material/Category';
import { createClient } from '@supabase/supabase-js';
import ProtectedRoute from '@/components/ProtectedRoute';

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Vendor {
  vendor_id: string;
  vendor_name: string;
  phone: string;
  category: string;
  created_at: string;
}

export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const categories = ['電腦硬體', '電腦設備', '晶片供應'];

  // ✅ 抓取 Supabase 資料
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors:', error.message);
      showSnackbar('載入廠商資料失敗', 'error');
    } else {
      setVendors(data || []);
    }
  };

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
      resetForm();
      setOpen(false);
      showSnackbar('✅ 廠商新增成功！', 'success');
    }
  };

  // ✅ 編輯廠商
  const handleEditVendor = async () => {
    setError('');

    if (!name.trim() || !contact.trim() || !category.trim()) {
      setError('請填寫所有欄位');
      return;
    }

    if (!currentVendor) return;

    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        vendor_name: name.trim(),
        phone: contact.trim(),
        category: category.trim(),
      })
      .eq('vendor_id', currentVendor.vendor_id);

    if (updateError) {
      setError(`更新失敗：${updateError.message}`);
    } else {
      await fetchVendors();
      resetForm();
      setOpen(false);
      setEditMode(false);
      showSnackbar('✅ 廠商資料更新成功！', 'success');
    }
  };

  // ✅ 刪除廠商
  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return;

    const { error: deleteError } = await supabase
      .from('vendors')
      .delete()
      .eq('vendor_id', vendorToDelete.vendor_id);

    if (deleteError) {
      showSnackbar(`刪除失敗：${deleteError.message}`, 'error');
    } else {
      setVendors((prev) => prev.filter((v) => v.vendor_id !== vendorToDelete.vendor_id));
      showSnackbar('🗑️ 廠商已刪除', 'success');
    }

    setDeleteDialogOpen(false);
    setVendorToDelete(null);
  };

  // 開啟編輯對話框
  const openEditDialog = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setName(vendor.vendor_name);
    setContact(vendor.phone);
    setCategory(vendor.category);
    setEditMode(true);
    setOpen(true);
  };

  // 開啟新增對話框
  const openAddDialog = () => {
    resetForm();
    setEditMode(false);
    setOpen(true);
  };

  // 重置表單
  const resetForm = () => {
    setName('');
    setContact('');
    setCategory('');
    setError('');
    setCurrentVendor(null);
  };

  // 顯示提示訊息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)',
          py: 6,
        }}
      >
        <Container>
          {/* 頁面標題 */}
          <Fade in={true} timeout={800}>
            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
                background: `linear-gradient(135deg, ${indigo[100]}, ${teal[50]})`,
                p: 4,
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: indigo[900], mb: 1 }}>
                🏢 廠商管理系統
              </Typography>
              <Typography variant="body1" sx={{ color: grey[700] }}>
                管理合作廠商資訊與聯絡方式
              </Typography>
              <Chip
                label={`共 ${vendors.length} 家廠商`}
                sx={{ mt: 2, bgcolor: 'white', fontWeight: 600 }}
              />
            </Box>
          </Fade>

          {/* 廠商卡片 */}
          <Grid container spacing={3}>
            {vendors.map((vendor, index) => (
              <Grid item xs={12} md={6} lg={4} key={vendor.vendor_id}>
                <Fade in={true} timeout={800 + index * 100}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
                      },
                    }}
                  >
                    <CardContent>
                      {/* 廠商編號 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ color: teal[600], mr: 1, fontSize: 28 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: indigo[900] }}>
                            {vendor.vendor_id}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="編輯">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(vendor)}
                              sx={{
                                color: amber[700],
                                '&:hover': { bgcolor: amber[50] },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="刪除">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setVendorToDelete(vendor);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{
                                color: red[600],
                                '&:hover': { bgcolor: red[50] },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* 廠商名稱 */}
                      <Typography
                        variant="h6"
                        sx={{ color: indigo[800], fontWeight: 600, mb: 2 }}
                      >
                        {vendor.vendor_name}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* 聯絡電話 */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ color: grey[600], fontSize: 18, mr: 1 }} />
                          <Typography variant="body2" sx={{ color: grey[700] }}>
                            {vendor.phone}
                          </Typography>
                        </Box>

                        {/* 類別 */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CategoryIcon sx={{ color: grey[600], fontSize: 18, mr: 1 }} />
                          <Chip
                            label={vendor.category}
                            size="small"
                            sx={{
                              bgcolor: teal[50],
                              color: teal[800],
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* 空狀態 */}
          {vendors.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 80, color: grey[300], mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                尚無廠商資料
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                點擊右下角的 ＋ 按鈕新增第一家廠商
              </Typography>
            </Box>
          )}

          {/* ➕ 浮動新增按鈕 */}
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              bgcolor: teal[500],
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: teal[600],
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={openAddDialog}
          >
            <AddIcon />
          </Fab>

          {/* 🧾 Dialog：新增/編輯廠商表單 */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              {editMode ? '✏️ 編輯廠商' : '➕ 新增廠商'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="廠商名稱"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  required
                />
                <TextField
                  label="聯絡電話"
                  value={contact}
                  onChange={handleContactChange}
                  fullWidth
                  variant="outlined"
                  placeholder="例：02-1234-5678"
                  inputProps={{ maxLength: 12 }}
                  required
                />
                <TextField
                  select
                  label="類別"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                  variant="outlined"
                  required
                >
                  {categories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setOpen(false)} variant="outlined">
                取消
              </Button>
              <Button
                variant="contained"
                onClick={editMode ? handleEditVendor : handleAddVendor}
                sx={{
                  bgcolor: teal[500],
                  '&:hover': { bgcolor: teal[600] },
                }}
              >
                {editMode ? '更新' : '新增'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* 🗑️ 刪除確認對話框 */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle sx={{ fontWeight: 700 }}>⚠️ 確認刪除</DialogTitle>
            <DialogContent>
              <Typography>
                確定要刪除廠商 <strong>{vendorToDelete?.vendor_name}</strong> 嗎？
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                此操作無法復原。
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                取消
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteVendor}
              >
                確認刪除
              </Button>
            </DialogActions>
          </Dialog>

          {/* 提示訊息 */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}