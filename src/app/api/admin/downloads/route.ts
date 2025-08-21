import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServerClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create service role client for bypassing RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create server client for user authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('member_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create service role client for bypassing RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create server client for user authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('member_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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