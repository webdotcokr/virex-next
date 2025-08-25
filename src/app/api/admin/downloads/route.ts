import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // 통합된 관리자 권한 검증
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Service Role 클라이언트 생성 (RLS 우회)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get request data
    const body = await request.json();
    const { title, file_name, file_url, category_id } = body;

    if (!title || !file_name || !file_url || !category_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, file_name, file_url, category_id' 
      }, { status: 400 });
    }

    // Insert download record using Service Role (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('downloads')
      .insert({
        title,
        file_name,
        file_url,
        category_id: parseInt(category_id),
        hit_count: 0
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: `Database insert failed: ${error.message}`,
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });

  } catch (error) {
    console.error('Admin downloads API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 통합된 관리자 권한 검증
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Service Role 클라이언트 생성 (RLS 우회)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get request data
    const body = await request.json();
    const { id, title, file_name, file_url, category_id } = body;

    if (!id || !title || !file_name || !file_url || !category_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, title, file_name, file_url, category_id' 
      }, { status: 400 });
    }

    // Update download record using Service Role (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('downloads')
      .update({
        title,
        file_name,
        file_url,
        category_id: parseInt(category_id)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: `Database update failed: ${error.message}`,
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });

  } catch (error) {
    console.error('Admin downloads update API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}