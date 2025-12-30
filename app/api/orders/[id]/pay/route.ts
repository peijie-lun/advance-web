import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// 主要程式邏輯是「訂單付款 API」：驗證使用者身份、確認訂單歸屬與狀態，
// 然後模擬付款（將訂單狀態改為 paid），最後回傳結果。只有訂單本人且訂單狀態為 pending 才能付款。
// 依據 access token 建立 Supabase client，讓後續查詢都帶有使用者授權
function getSupabaseWithAuth(token: string | undefined) {// 建立 Supabase 客戶端，帶入授權 token
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },// 如果有 token 就帶上 Bearer 認證頭 讓後端能辨識使用者身份。
// 沒有 token 就不加認證頭，代表匿名請求。  //token（令牌）是一段加密字串，用來代表使用者的身份和授權狀態。
// 在登入後，後端會發給使用者一個 token，之後每次 API 請求都要帶上這個 token，後端才能辨識你是誰、是否有權限執行操作。
      },
      auth: { persistSession: false },// 不要自動儲存 session
    }
  );
}

// API Route: 處理訂單付款（POST 請求）
export async function POST(//API 的主入口，負責整個付款流程。 
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }// 從路由參數取得訂單 id
) {
  try {
    // 取得路由參數（訂單 id）
    const { id } = await params;// 從 params 中解構出 id，這是訂單的唯一識別碼

    // 1. 從 header 取得 access token，這是用戶的登入憑證
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    // 用 token 建立 supabase client
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者身份（token 是否有效、是否有登入）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // 沒有登入或 token 錯誤，回傳 401
      return NextResponse.json({ error: '未登入' }, { status: 401 });// 回傳未授權錯誤
    }

    // 3. 查詢訂單，確認訂單是否存在
    // 只查詢單一訂單（order_id = id）
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', id)// 比對訂單 ID //id 是從路由參數取得的訂單識別碼
      .single();

    if (orderError || !order) {
      // 訂單不存在，回傳 404
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 4. 權限檢查：只能付款自己的訂單
    if (order.user_id !== user.id) {
      // 不是自己的訂單，禁止操作，回傳 403
      return NextResponse.json({ error: '無權限操作此訂單' }, { status: 403 });
    }

    // 5. 檢查訂單狀態：只有 pending 狀態可以付款
    if (order.status !== 'pending') {
      // 狀態不是 pending，不能付款，回傳 400
      return NextResponse.json({ 
        error: '此訂單不可付款（狀態：' + order.status + '）' 
      }, { status: 400 });
    }

    // 6. 模擬付款處理（實際場景會串接金流 API）
    // 這裡直接將訂單狀態改為 'paid'
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid'
      })
      .eq('order_id', id)
      .select()// 取得更新後的訂單資料
      .single();

    if (updateError) {
      // 更新失敗，回傳 500
      return NextResponse.json({ error: '付款失敗：' + updateError.message }, { status: 500 });
    }

    // 付款成功，回傳更新後的訂單資料
    return NextResponse.json({
      success: true,
      message: '付款成功',
      order: updatedOrder,
    });

  } catch (error: any) {
    // 例外處理，回傳 500
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
