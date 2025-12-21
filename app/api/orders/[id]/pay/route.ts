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

// POST - 模擬付款（使用者專用）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 從 header 取得 access token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 查詢訂單，確認是否為該使用者的訂單
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 4. 權限檢查：只能付款自己的訂單
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: '無權限操作此訂單' }, { status: 403 });
    }

    // 5. 檢查訂單狀態：只有 pending 狀態可以付款
    if (order.status !== 'pending') {
      return NextResponse.json({ 
        error: '此訂單不可付款（狀態：' + order.status + '）' 
      }, { status: 400 });
    }

    // 6. 模擬付款處理（實際場景會串接金流 API）
    // 這裡我們直接將訂單狀態改為 'paid'
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid'
      })
      .eq('order_id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: '付款失敗：' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '付款成功',
      order: updatedOrder,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
