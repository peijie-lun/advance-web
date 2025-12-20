'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Fab, Typography, TextField, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add as AddIcon, Inventory2 as EmptyIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 引入元件
import OrderHeader from './components/OrderHeader';
import OrderDialog from './components/OrderDialog';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface CartItem {
  cart_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export default function ProductList() {
  const { user, role, loading: authLoading } = useAuth();// 監聽登入狀態 
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // 監聽登入狀態 - 使用 useAuth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 讀取商品列表
  const fetchProducts = async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.ilike('name', `%${search}%`);
    }
    const { data, error } = await query;//await 只能用在 async 函式裡。
//它會「暫停」程式，等到右邊的 Promise 結果回來，再繼續執行
    if (error) console.error(error.message);
    else setProducts(data as Product[]);
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // 加入購物車
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
      await supabase.from('cart').insert([
        { user_id: user.id, product_id: product.product_id, quantity: 1 },
      ]);
    }
    fetchCart();
  };

  const fetchCart = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart')
      .select(`cart_id, product_id, quantity, products(name, price)`)
      .eq('user_id', user.id);
    if (error) console.error(error.message);
    else {
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

  useEffect(() => {
    fetchCart();
  }, [user]);

  // 新增/編輯商品 (管理者)
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

  const handleEditProduct = (product: Product) => {
    setItem(product.name);
    setAmount(product.price.toString());
    setEditProduct(product);
    setIsEditMode(true);
    setDialogOpen(true);
  };

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

  const handleDeleteProduct = async (product_id: string) => {
    if (!confirm('確定要刪除此商品嗎？')) return;
    await supabase.from('products').delete().eq('product_id', product_id);
    fetchProducts();
  };

  const resetForm = () => {
    setItem('');
    setAmount('');
    setEditProduct(null);
    setIsEditMode(false);
    setDialogOpen(false);
    setError(null);
  };

  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>載入中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)', pb: 8 }}>
      <OrderHeader user={user} onLogout={handleLogout} />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* 搜尋框 */}
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

        {/* 商品列表 */}
        {products.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, opacity: 0.7 }}>
            <EmptyIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">目前沒有商品</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((p) => (
              <Grid item component="div" key={p.product_id} xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    textAlign: 'center',
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
                    <Box sx={{ mt: 1, display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          fontWeight: 600,
                          color: '#2563eb',
                          borderColor: '#2563eb',
                          '&:hover': { background: '#eff6ff', borderColor: '#1d4ed8', color: '#1d4ed8' },
                        }}
                        onClick={() => handleEditProduct(p)}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          fontWeight: 600,
                          borderColor: '#ef4444',
                          color: '#ef4444',
                          '&:hover': { background: '#fef2f2', borderColor: '#b91c1c', color: '#b91c1c' },
                        }}
                        onClick={() => handleDeleteProduct(p.product_id)}
                      >
                        刪除
                      </Button>
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

      {/* 新增/編輯商品 Dialog */}
      {role === 'admin' && (
        <OrderDialog
          open={dialogOpen}
          isEditMode={isEditMode}
          item={item}
          setItem={setItem}
          amount={amount}
          setAmount={setAmount}
          error={error}
          onClose={resetForm}
          onSubmit={isEditMode ? handleUpdateProduct : handleAddProduct}
        />
      )}
    </Box>
  );
}
