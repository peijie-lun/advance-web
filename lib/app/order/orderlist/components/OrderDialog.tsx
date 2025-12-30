// components/OrderDialog.tsx
//「商品新增／編輯對話框」元件（OrderDialog），主要用於管理者新增或編輯商品時彈出的表單
import React from 'react';
import { Dialog, DialogTitle, DialogContent, Stack, TextField, InputAdornment, Typography, DialogActions, Button } from '@mui/material';
import { ShoppingBag as ShoppingBagIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material';

type OrderDialogProps = {
  open: boolean;
  isEditMode: boolean;
  item: string;
  setItem: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
};
//解構賦值 直接從 props 取得各種參數，型別由 OrderDialogProps 定義
export default function OrderDialog({
  open,
  isEditMode,
  item,
  setItem,
  amount,
  setAmount,
  error,
  onClose,
  onSubmit,
}: OrderDialogProps) {
  return (
    <Dialog
      open={open}//對話框是否開啟
      onClose={onClose}//關閉對話框的回呼函式
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
            onChange={(e) => setItem(e.target.value)}//更新商品名稱的回呼函式
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