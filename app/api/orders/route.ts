import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

//「建立訂單」與「查詢訂單列表」

// 依據 access token 建立 Supabase client，讓查詢都帶有使用者授權
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
export async function POST(request: NextRequest) {//API 的主入口，負責整個建立訂單流程。
  try {
    // 1. 從 header 取得 access token（辨識使用者）
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');// 取得 token 字串 //去掉 "Bearer " 前綴
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者（token 是否有效）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // 沒有登入
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 從購物車撈出商品（cart + products 關聯查詢）
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
      .eq('user_id', user.id);// 只撈目前使用者的購物車商品

    if (cartError) {
      // 查詢失敗
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    // 4. 若購物車為空，不能建立訂單
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: '購物車是空的' }, { status: 400 });
    }

    // 5. 計算總金額（所有商品價格*數量加總）
    const totalAmount = cartItems.reduce((sum, item: any) => {// item 代表購物車中的每一項商品 //any表示不確定的類型 //
      return sum + (item.products.price * item.quantity);//reduce 是陣列的累加函式，會把所有商品的「單價 × 數量」加總起來。
      // sum 是累加器，初始值為 0，每次迭代會把當前商品的總價加到 sum 上。
    }, 0);

    // 6. 建立訂單（orders）
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending', // 新訂單預設狀態
        }
      ])
      .select()// 取得更新後的訂單資料
      .single();// 只取回剛建立的那筆訂單資料

    if (orderError) {
      // 訂單建立失敗
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 7. 建立訂單項目（order_items） 把購物車裡的商品資料，轉換成訂單項目的格式，準備寫入 order_items 資料表
    const orderItems = cartItems.map((item: any) => ({// 迭代購物車商品，轉成訂單項目格式 //map 是陣列的轉換函式，會把 cartItems 陣列中的每一項商品轉換成新的物件格式。
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
      // 插入失敗，理論上要回滾訂單，但 Supabase 不支援 transaction
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 8. 清空購物車（cart）
    const { error: deleteError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      // 清空失敗只記錄，不影響訂單建立
      console.error('清空購物車失敗:', deleteError);
    }

    // 回傳訂單資訊
    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      total_amount: totalAmount,
    });

  } catch (error: any) {
    // 例外處理
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - 查詢訂單列表
export async function GET(request: NextRequest) {//API 的主入口，負責整個查詢訂單列表流程。
  try {
    // 1. 從 header 取得 access token（辨識使用者）
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();//回傳結果是一個物件，裡面有 data（使用者資料）和 error（錯誤訊息）。 //直接取得 user（使用者物件）和 authError（認證錯誤）。
    if (authError || !user) {
      // 沒有登入
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 取得使用者角色（判斷是否為管理者）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';// 預設角色為一般使用者

    // 4. 查詢訂單（管理者看全部，一般使用者只看自己的）
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });// 最新訂單在前面 //建立一個基本的查詢物件 query，預設是查詢 orders 資料表，並依照 created_at 欄位做降冪排序。

    if (role !== 'admin') {
      // 一般使用者只能看自己的訂單
      query = query.eq('user_id', user.id);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      // 查詢失敗
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    // 回傳訂單列表
    return NextResponse.json({ orders });

  } catch (error: any) {
    // 例外處理
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
