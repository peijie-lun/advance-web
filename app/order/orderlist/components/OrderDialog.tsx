// components/OrderDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, Stack, TextField, InputAdornment, Typography, DialogActions, Button } from '@mui/material';
import { ShoppingBag as ShoppingBagIcon, AttachMoney as AttachMoneyIcon, Link as LinkIcon } from '@mui/icons-material';

type OrderDialogProps = {
  open: boolean;
  isEditMode: boolean;
  item: string;
  setItem: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  url: string;  // 新增
  setUrl: (value: string) => void;  // 新增
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
};

export default function OrderDialog({//解收父元件傳來的屬性
  open,
  isEditMode,
  item,
  setItem,
  amount,
  setAmount,
  url,  // 新增
  setUrl,  // 新增
  error,
  onClose,
  onSubmit,
}: OrderDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, width: '100%', maxWidth: 400, p: 1 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 3 }}>
        {isEditMode ? '✏️ 編輯訂單' : '✨ 新增訂單'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="商品名稱"
            placeholder="例如：機械鍵盤"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ShoppingBagIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField
            fullWidth
            label="金額"
            placeholder="0"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          {/* 新增 URL 輸入欄位 */}
          <TextField
            fullWidth
            label="商品連結"
            placeholder="https://www.momoshop.com.tw/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            variant="outlined"
            helperText="選填：輸入商品詳情頁面的完整網址"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          {error && (
            <Typography color="error" variant="body2" align="center" sx={{ bgcolor: '#fee2e2', p: 1, borderRadius: 2 }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8', borderRadius: 2, px: 3 }}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          sx={{
            borderRadius: 2,
            px: 4,
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          確認儲存
        </Button>
      </DialogActions>
    </Dialog>
  );
}