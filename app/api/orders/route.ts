import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


function getSupabaseWithAuth(token: string | undefined) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
      auth: { persistSession: false },
    }
  );
}

// POST - 建立訂單（從購物車）
export async function POST(request: NextRequest) {
  try {
    // 1. 從 header 取得 access token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 從購物車撈出商品
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select(`
        cart_id,
        product_id,
        quantity,
        products (
          name,
          price
        )
      `)
      .eq('user_id', user.id);

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    // 4. 若購物車為空
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: '購物車是空的' }, { status: 400 });
    }

    // 5. 計算總金額
    const totalAmount = cartItems.reduce((sum, item: any) => {
      return sum + (item.products.price * item.quantity);
    }, 0);

    // 6. 建立訂單
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 7. 建立訂單項目（order_items）
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.order_id,
      product_id: item.product_id,
      product_name: item.products.name,
      price: item.products.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // 如果插入失敗，應該要回滾訂單，但 Supabase 不支援 transaction
      // 這裡簡化處理
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 8. 清空購物車
    const { error: deleteError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('清空購物車失敗:', deleteError);
    }

    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      total_amount: totalAmount,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - 查詢訂單列表
export async function GET(request: NextRequest) {
  try {
    // 1. 從 header 取得 access token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 取得使用者角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';

    // 4. 查詢訂單
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // 一般使用者只能看自己的訂單
    if (role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    return NextResponse.json({ orders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
