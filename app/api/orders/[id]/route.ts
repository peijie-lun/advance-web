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

// GET - 查詢單筆訂單明細
export async function GET(
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

    // 3. 查詢訂單
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

    // 5. 權限檢查：一般使用者只能看自己的訂單
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

    return NextResponse.json({
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
    const body = await request.json();
    const { status } = body;

    // 6. 驗證狀態值
    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
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

    return NextResponse.json({
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

    return NextResponse.json({
      success: true,
      message: '訂單已刪除',
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
