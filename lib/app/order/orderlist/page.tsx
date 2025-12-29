'use client';
//是「商品列表＋購物車」主頁，結合商品管理、購物車操作、搜尋、登入保護等功能


import React, { useEffect, useState } from 'react';
import { Box, Container, Fab, Typography, TextField, Button, IconButton, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add as AddIcon, Inventory2 as EmptyIcon, ShoppingCart as CartIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  const { user, role, loading: authLoading } = useAuth();// 取得目前使用者、角色和載入狀態 
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
    if (!authLoading && !user) {//如果載入完成且沒有使用者，導向登入頁
      router.push('/login');
    }
  }, [user, authLoading, router]);//依賴 user、authLoading、router 變化

  // 讀取商品列表
  const fetchProducts = async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });//從 products 資料表選取所有欄位，並依照 created_at 欄位降冪排序
    if (search.trim()) {//如果有搜尋關鍵字，則加入模糊搜尋條件
      query = query.ilike('name', `%${search}%`);// ilike 是不區分大小寫的模糊搜尋
    }
    const { data, error } = await query;//await 只能用在 async 函式裡。
//它會「暫停」程式，等到右邊的 Promise 結果回來，再繼續執行
    if (error) console.error(error.message);
    else setProducts(data as Product[]);//更新商品列表狀態
  };

  useEffect(() => {//每當 search 狀態改變時，重新撈取商品列表
    fetchProducts();
  }, [search]);

  // 加入購物車
  const handleAddToCart = async (product: Product) => {//當使用者點擊「加入購物車」按鈕時會呼叫此函式
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
        .eq('cart_id', existingCart.cart_id);//更新購物車中該商品的數量加 1
    } else {
      await supabase.from('cart').insert([//新增一筆購物車資料
        { user_id: user.id, product_id: product.product_id, quantity: 1 },
      ]);
    }
    fetchCart();//重新撈取購物車資料
  };
// user_id 是資料庫（Supabase）中 cart 資料表的欄位，用來儲存「購物車屬於哪個使用者」。

// 而 user.id 是目前登入使用者的唯一識別碼（ID），這個值是從 useAuth() 取得的 user 物件裡的 id 屬性。

// 這行的意思是：「只查詢 user_id 等於目前登入者 id 的購物車資料」

//自動取得目前登入者的購物車資料」，並更新到畫面上
  const fetchCart = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart')
      .select(`cart_id, product_id, quantity, products(name, price)`)
      .eq('user_id', user.id);//篩選出目前使用者的購物車資料
    if (error) console.error(error.message);
    else {
      const cartItems = (data as any[]).map((c) => ({//整理成 CartItem 陣列
        cart_id: c.cart_id,
        product_id: c.product_id,
        product_name: c.products.name,
        price: c.products.price,
        quantity: c.quantity,
      }));
      setCart(cartItems);//更新購物車狀態
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);//當 user 改變時，載入購物車資料


  // 新增/編輯商品 (管理者)
  const handleAddProduct = async () => {
    setError(null);
    if (!item.trim()) return setError('請輸入商品名稱');//trim() 去除前後空白
    const priceNum = Number(amount);//把價格字串轉成數字
    if (!amount || isNaN(priceNum) || priceNum <= 0) return setError('價格需大於 0');//檢查價格是否有效  //isNaN(priceNum)：如果價格不是數字

    const newProduct = { name: item.trim(), price: priceNum };//建立新商品物件 //
    const { data, error: insertError } = await supabase.from('products').insert([newProduct]).select();//插入新商品到 products 資料表
    if (insertError) setError(insertError.message);
    else fetchProducts();//重新撈取商品列表

    resetForm();
  };

  const handleEditProduct = (product: Product) => {//當使用者點擊「編輯」按鈕時會呼叫此函式
    setItem(product.name);
    setAmount(product.price.toString());
    setEditProduct(product);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleUpdateProduct = async () => {//當使用者在編輯模式下提交表單時會呼叫此函式
    if (!editProduct) return;
    const priceNum = Number(amount);
    if (!item.trim()) return setError('請輸入商品名稱');//檢查商品名稱是否為空
    if (!amount || isNaN(priceNum) || priceNum <= 0) return setError('價格需大於 0');//檢查價格是否有效  //isNaN(priceNum)：如果價格不是數字

    const { error } = await supabase
      .from('products')
      .update({ name: item.trim(), price: priceNum })//更新商品名稱和價格
      .eq('product_id', editProduct.product_id);
    if (error) setError(error.message);
    else fetchProducts();//重新撈取商品列表

    resetForm();//重置表單狀態
  };

  const handleDeleteProduct = async (product_id: string) => {
    if (!confirm('確定要刪除此商品嗎？')) return;
    await supabase.from('products').delete().eq('product_id', product_id);
    fetchProducts();//重新撈取商品列表
  };

  const resetForm = () => {
    setItem('');
    setAmount('');
    setEditProduct(null);
    setIsEditMode(false);
    setDialogOpen(false);
    setError(null);
  };

  const { signOut } = useAuth();//從 AuthContext 取得 signOut 函式
  const handleLogout = async () => {//當使用者點擊登出按鈕時會呼叫此函式
    await signOut();//呼叫 signOut 函式進行登出
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

        {/* 搜尋框 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="搜尋商品"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}//當搜尋框內容改變時更新 search 狀態
          />
          <Button variant="contained" onClick={fetchProducts}>搜尋</Button> {/* 當使用者點擊搜尋按鈕時會呼叫 fetchProducts 函式 */}
        </Box>

        {/* 商品列表 */}
        {products.length === 0 ? (//如果沒有商品，顯示空狀態
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
                    {p.name} {/* 商品名稱 */}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#6366f1', mb: 2 }}>
                    NT$ {p.price} {/* 商品價格 */}
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
                          onClick={() => handleEditProduct(p)}//點擊編輯按鈕會呼叫 handleEditProduct 函式
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
                          onClick={() => handleDeleteProduct(p.product_id)}//點擊刪除按鈕會呼叫 handleDeleteProduct 函式
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
                      onClick={() => handleAddToCart(p)}//點擊加入購物車按鈕會呼叫 handleAddToCart 函式
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
          onClick={() => setDialogOpen(true)}//點擊浮動按鈕會打開新增商品對話框
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
          onSubmit={isEditMode ? handleUpdateProduct : handleAddProduct}//根據是否為編輯模式決定提交函式 //新增或更新商品 
        />

        
//         //如果 isEditMode 為 true（編輯模式），onSubmit 就會執行 handleUpdateProduct（更新商品）。
// 如果 isEditMode 為 false（新增模式），onSubmit 就會執行 handleAddProduct（新增商品）
      )}
    </Box>
  );
}
