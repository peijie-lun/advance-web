import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
//單筆訂單的查詢、狀態更新、刪除
// 依據 access token 建立 Supabase client，讓查詢都帶有使用者授權
function getSupabaseWithAuth(token: string | undefined) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },// 如果有 token 就帶上 Bearer 認證頭 //讓後端能辨識使用者身份
      },
      auth: { persistSession: false },
    }
  );
}

// GET - 查詢單筆訂單明細
export async function GET(//API 的主入口，負責整個查詢流程。
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }// 從路由參數取得訂單 id
) {
  try {
    const { id } = await params;// 從 params 中解構出 id，這是訂單的唯一識別碼

    // 1. 從 header 取得 access token（用於辨識使用者）
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');// 取得 token 字串 //去掉 "Bearer " 前綴
    const supabase = getSupabaseWithAuth(token);// 用 token 建立 supabase client

    // 2. 驗證使用者（token 是否有效）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // 沒有登入或 token 錯誤
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 查詢訂單（order_id = id）
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', id)// 比對訂單 ID //id 是從路由參數取得的訂單識別碼
      .single();

    if (orderError) {
      // 訂單不存在
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 4. 取得使用者角色（判斷是否為管理者）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)// 透過使用者 ID 查詢角色 //user.id 是目前登入使用者的 ID
      .single();

    const role = profile?.role ?? 'user';// 預設角色為一般使用者

    // 5. 權限檢查：一般使用者只能看自己的訂單，管理者可看全部
    if (role !== 'admin' && order.user_id !== user.id) {
      return NextResponse.json({ error: '無權限查看此訂單' }, { status: 403 });
    }

    // 6. 查詢訂單項目（order_items）
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      // 查詢失敗
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 回傳訂單明細與項目
    return NextResponse.json({
      order,
      items,
    });

  } catch (error: any) {
    // 例外處理
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - 更新訂單狀態（管理者專用）
export async function PATCH(//API 的主入口，負責整個更新流程。
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }// 從路由參數取得訂單 id
) {
  try {
    const { id } = await params;// 從 params 中解構出 id，這是訂單的唯一識別碼

    // 1. 從 header 取得 access token（辨識操作者）
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // 沒有登入
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 取得使用者角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';// 預設角色為一般使用者

    // 4. 權限檢查：只有管理者可以修改訂單狀態
    if (role !== 'admin') {
      return NextResponse.json({ error: '無權限修改訂單' }, { status: 403 });
    }

    // 5. 取得要更新的狀態（從 body 解析）
    const body = await request.json();// 解析請求體為 JSON
    const { status } = body;// 從 body 中取得新的狀態值
//const body = await request.json();

// 這行會把前端傳來的 HTTP 請求內容（body）解析成 JavaScript 物件。
// 例如前端用 fetch 傳送 PATCH 請求時，body 可能是 { "status": "shipped" }。
// 這裡解析後，body 就是 { status: "shipped" } 這樣的物件。
// const { status } = body;

// 從剛剛解析出來的 body 物件中，取出 status 欄位。
// 這個 status 就是前端要更新的訂單狀態（如 pending、paid、shipped 等）。


    // 6. 驗證狀態值（只能是預設幾種）
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {// 狀態值無效 //不存在或不在允許範圍內
      return NextResponse.json({ error: '無效的訂單狀態' }, { status: 400 });
    }

    // 7. 更新訂單狀態
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', id)
      .select()// 取得更新後的訂單資料
      .single();

    if (updateError) {
      // 更新失敗
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 回傳更新後的訂單
    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error: any) {
    // 例外處理
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - 刪除訂單（管理者專用）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }// 從路由參數取得訂單 id
) {
  try {
    const { id } = await params;// 從 params 中解構出 id，這是訂單的唯一識別碼

    // 1. 從 header 取得 access token（辨識操作者）
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // 沒有登入
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 取得使用者角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)// 透過使用者 ID 查詢角色 //user.id 是目前登入使用者的 ID
      .single();

    const role = profile?.role ?? 'user';// 預設角色為一般使用者

    // 4. 權限檢查：只有管理者可以刪除訂單
    if (role !== 'admin') {
      return NextResponse.json({ error: '無權限刪除訂單' }, { status: 403 });
    }

    // 5. 先刪除訂單項目（order_items）
    const { error: itemsDeleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsDeleteError) {
      // 刪除 order_items 失敗
      return NextResponse.json({ error: '刪除訂單項目失敗：' + itemsDeleteError.message }, { status: 500 });
    }

    // 6. 刪除訂單本身
    const { error: orderDeleteError } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', id);

    if (orderDeleteError) {
      // 刪除訂單失敗
      return NextResponse.json({ error: '刪除訂單失敗：' + orderDeleteError.message }, { status: 500 });
    }

    // 回傳刪除成功訊息
    return NextResponse.json({
      success: true,
      message: '訂單已刪除',
    });

  } catch (error: any) {
    // 例外處理
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
