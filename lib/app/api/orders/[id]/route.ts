import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
//單一訂單」的 API 處理，支援 GET（查詢）、PATCH（更新狀態）、DELETE（刪除）三種操作。重點說明如下：
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

// GET - 查詢單筆訂單明細
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }//從路由參數中取得訂單 ID
) {
  try {
    const { id } = await params;

    // 1. 從 header 取得 access token //這是用來取得並驗證用戶身分，讓後續操作都能知道是誰在存取資料
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = getSupabaseWithAuth(token);

    // 2. 驗證使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 3. 查詢訂單  查詢 orders 資料表，找出對應的訂單
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', id)
      .single();

    if (orderError) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 4. 取得使用者角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';

    // 5. 權限檢查：一般使用者只能看自己的訂單 權限檢查：如果不是 admin，且訂單不是自己的，回傳 403 無權限
    if (role !== 'admin' && order.user_id !== user.id) {
      return NextResponse.json({ error: '無權限查看此訂單' }, { status: 403 });
    }

    // 6. 查詢訂單項目
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({//回傳訂單資料和訂單項目給前端
      order,
      items,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - 更新訂單狀態（管理者專用）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }//從路由參數中取得訂單 ID
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

    // 3. 取得使用者角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';

    // 4. 權限檢查：只有管理者可以修改訂單狀態
    if (role !== 'admin') {
      return NextResponse.json({ error: '無權限修改訂單' }, { status: 403 });
    }

    // 5. 取得要更新的狀態
    const body = await request.json();//解析請求的 JSON 主體
    const { status } = body;//從主體中取得 status 欄位

    // 6. 驗證狀態值
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];//有效的訂單狀態列表
    if (!status || !validStatuses.includes(status)) {//檢查 status 是否存在且在有效列表中 //如果無效，回傳 400 錯誤 //
      return NextResponse.json({ error: '無效的訂單狀態' }, { status: 400 });
    }

    // 7. 更新訂單狀態
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({//回傳更新後的訂單資料給前端
      success: true,
      order,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - 刪除訂單（管理者專用）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }//從路由參數中取得訂單 ID
) {
  try {
    const { id } = await params;//取得訂單 ID

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
      return NextResponse.json({ error: '刪除訂單項目失敗：' + itemsDeleteError.message }, { status: 500 });
    }

    // 6. 刪除訂單
    const { error: orderDeleteError } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', id);

    if (orderDeleteError) {
      return NextResponse.json({ error: '刪除訂單失敗：' + orderDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({//回傳刪除成功的訊息給前端
      success: true,
      message: '訂單已刪除',
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
