// components/OrderDialog.tsx
//訂單新增/編輯對話框
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

// OrderDialog 元件：彈出式對話框，編輯/新增訂單
export default function OrderDialog({
  open,           // 是否開啟對話框
  isEditMode,     // true: 編輯模式，false: 新增模式
  item,           // 商品名稱
  setItem,        // 設定商品名稱
  amount,         // 金額
  setAmount,      // 設定金額
  url,            // 商品連結
  setUrl,         // 設定商品連結
  error,          // 錯誤訊息
  onClose,        // 關閉對話框
  onSubmit,       // 送出表單
}: OrderDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, width: '100%', maxWidth: 400, p: 1 },
      }}
    >
      {/* 標題：根據模式顯示不同文字 */}
      <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 3 }}>
        {isEditMode ? '✏️ 編輯訂單' : '✨ 新增訂單'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 商品名稱輸入欄位 */}
          <TextField
            fullWidth
            label="商品名稱"
            placeholder="例如：機械鍵盤"
            value={item}
            onChange={(e) => setItem(e.target.value)}//更新商品名稱狀態
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
          {/* 金額輸入欄位 */}
          <TextField
            fullWidth
            label="金額"
            placeholder="0"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}//更新金額狀態
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
          {/* 商品連結輸入欄位（選填） */}
          <TextField
            fullWidth
            label="商品連結"
            placeholder="https://www.momoshop.com.tw/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}//更新商品連結狀態
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
          {/* 錯誤訊息顯示區塊 */}
          {error && (
            <Typography color="error" variant="body2" align="center" sx={{ bgcolor: '#fee2e2', p: 1, borderRadius: 2 }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      {/* 底部操作按鈕 */}
      <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8', borderRadius: 2, px: 3 }}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}// 點擊送出表單
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
