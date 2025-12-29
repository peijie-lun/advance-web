'use client';

// 匯入 React 及常用 Hook
import React, { useEffect, useState } from 'react';
import { Box, Container, Fab, Typography, TextField, Button, IconButton, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add as AddIcon, Inventory2 as EmptyIcon, ShoppingCart as CartIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CardActionArea } from '@mui/material';

// 引入元件
import OrderHeader from './components/OrderHeader';
import OrderDialog from './components/OrderDialog';

// 建立 supabase 連線，讓你可以操作資料庫
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  product_id: string;
  name: string;
  price: number;
  url?: string;
}

interface CartItem {
  cart_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}


export default function ProductList() {
  // 取得目前登入的 user、角色、載入狀態（Context）
  const { user, role, loading: authLoading } = useAuth();
  // 商品列表狀態
  const [products, setProducts] = useState<Product[]>([]);
  // 搜尋關鍵字
  const [search, setSearch] = useState('');
  // 購物車內容
  const [cart, setCart] = useState<CartItem[]>([]);
  // 控制新增/編輯商品 Dialog 是否開啟
  const [dialogOpen, setDialogOpen] = useState(false);
  // 商品名稱、金額、連結
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [url, setUrl] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  // 表單錯誤訊息
  const [error, setError] = useState<string | null>(null);

  // Next.js 路由控制
  const router = useRouter();

  // 只要 user 狀態變成未登入，導向登入頁
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 讀取商品列表，支援搜尋
  const fetchProducts = async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (search.trim()) {
      // 有搜尋關鍵字時，模糊搜尋商品名稱
      query = query.ilike('name', `%${search}%`);
    }
    const { data, error } = await query;
    if (error) console.error(error.message);
    else setProducts(data as Product[]);
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // 加入購物車：如果商品已存在就數量+1，否則新增一筆
  const handleAddToCart = async (product: Product) => {
    if (!user) return;
    const { data: existingCart } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product.product_id)
      .single();

    if (existingCart) {
      // 已在購物車 -> 更新數量
      await supabase
        .from('cart')
        .update({ quantity: existingCart.quantity + 1 })
        .eq('cart_id', existingCart.cart_id);
    } else {
      // 不在購物車 -> 新增一筆
      await supabase.from('cart').insert([
        { user_id: user.id, product_id: product.product_id, quantity: 1 },
      ]);
    }
    fetchCart(); // 更新購物車內容
  };

  // 讀取目前使用者的購物車內容
  const fetchCart = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart')
      .select(`cart_id, product_id, quantity, products(name, price)`)
      .eq('user_id', user.id);
    if (error) console.error(error.message);
    else {
      // 整理購物車資料格式
      const cartItems = (data as any[]).map((c) => ({
        cart_id: c.cart_id,
        product_id: c.product_id,
        product_name: c.products.name,
        price: c.products.price,
        quantity: c.quantity,
      }));
      setCart(cartItems);
    }
  };
  // 只要 user 變動就重新查詢購物車
  useEffect(() => {
    fetchCart();
  }, [user]);

  // 管理者：新增商品
  const handleAddProduct = async () => {
    setError(null);
    if (!item.trim()) return setError('請輸入商品名稱');
    const priceNum = Number(amount);
    if (!amount || isNaN(priceNum) || priceNum <= 0) return setError('價格需大於 0');

    const newProduct = { name: item.trim(), price: priceNum };
    const { data, error: insertError } = await supabase.from('products').insert([newProduct]).select();
    if (insertError) setError(insertError.message);
    else fetchProducts();

    resetForm();
  };

  // 管理者：點擊編輯商品時，填入表單並開啟 Dialog
  const handleEditProduct = (product: Product) => {
    setItem(product.name);
    setAmount(product.price.toString());
    setUrl(product.url || '');
    setEditProduct(product);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  // 管理者：送出編輯商品
  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    const priceNum = Number(amount);
    if (!item.trim()) return setError('請輸入商品名稱');
    if (!amount || isNaN(priceNum) || priceNum <= 0) return setError('價格需大於 0');

    const { error } = await supabase
      .from('products')
      .update({ name: item.trim(), price: priceNum })
      .eq('product_id', editProduct.product_id);
    if (error) setError(error.message);
    else fetchProducts();

    resetForm();
  };

  // 管理者：刪除商品
  const handleDeleteProduct = async (product_id: string) => {
    if (!confirm('確定要刪除此商品嗎？')) return;
    await supabase.from('products').delete().eq('product_id', product_id);
    fetchProducts(); // 刪除後重新載入列表
  };

  // 清空表單內容與錯誤訊息，關閉 Dialog
  const resetForm = () => {
    setItem('');
    setAmount('');
    setUrl('');
    setEditProduct(null);
    setIsEditMode(false);
    setDialogOpen(false);
    setError(null);
  };

  // 登出功能，登出後導回首頁
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // 如果還在判斷登入狀態，顯示載入中畫面
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>載入中...</Typography>
      </Box>
    );
  }

  // 畫面主體區塊
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', pb: 8 }}>
      {/* 頁首，顯示使用者資訊與登出按鈕 */}
      <OrderHeader user={user} onLogout={handleLogout} />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* 訂單按鈕：管理者看「所有訂單」，使用者看「我的訂單」 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => router.push('/orders')}
            sx={{ fontWeight: 600 }}
          >
            {role === 'admin' ? '📋 查看所有訂單' : '📋 我的訂單'}
          </Button>
        </Box>

        {/* 搜尋框區塊 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="搜尋商品"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={fetchProducts}>搜尋</Button>
        </Box>

        {/* 商品列表區塊 */}
        {products.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, opacity: 0.7 }}>
            <EmptyIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">目前沒有商品</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((p) => (
              <Grid item key={p.product_id} xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
                    boxShadow: '0 4px 18px rgba(59,130,246,0.08)',
                    border: 'none',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: '0 8px 32px rgba(59,130,246,0.18)',
                      transform: 'translateY(-3px) scale(1.02)',
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#6366f1', mb: 2 }}>
                    NT$ {p.price}
                  </Typography>
                  {role === 'admin' ? (// 管理者顯示編輯刪除按鈕
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="編輯" arrow>
                        <IconButton
                          color="primary"
                          sx={{
                            background: '#e0e7ef',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                            '&:hover': { background: '#dbeafe', color: '#1d4ed8' },
                          }}
                          onClick={() => handleEditProduct(p)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="刪除" arrow>
                        <IconButton
                          color="error"
                          sx={{
                            background: '#fef2f2',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(239,68,68,0.10)',
                            '&:hover': { background: '#fee2e2', color: '#b91c1c' },
                          }}
                          onClick={() => handleDeleteProduct(p.product_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<CartIcon />}
                      sx={{
                        mt: 1,
                        borderRadius: 4,
                        px: 3,
                        py: 1.2,
                        fontWeight: 700,
                        fontSize: '1rem',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.15)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                          boxShadow: '0 8px 24px rgba(59,130,246,0.22)',
                          transform: 'translateY(-2px) scale(1.03)',
                        },
                      }}
                      onClick={() => handleAddToCart(p)}
                    >
                      加入購物車
                    </Button>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* 浮動新增按鈕（僅管理者可新增商品） */}
      {role === 'admin' && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setDialogOpen(true)}
          sx={{
            position: 'fixed', bottom: 40, right: 40,
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
            '&:hover': { transform: 'scale(1.1)' },
            transition: 'transform 0.2s',
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* 新增/編輯商品 Dialog（管理者專用） */}
      {role === 'admin' && (
        <OrderDialog
          open={dialogOpen}
          isEditMode={isEditMode}
          item={item}
          setItem={setItem}
          amount={amount}
          setAmount={setAmount}
          url={url}
          setUrl={setUrl}
          error={error}
          onClose={resetForm}
          onSubmit={isEditMode ? handleUpdateProduct : handleAddProduct}
        />
      )}
    </Box>
  );
}