import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
    }

    // 뉴스 조회
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: '뉴스를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: '뉴스를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 조회수 증가
    const { error: updateError } = await supabase
      .from('news')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('View count update error:', updateError);
      // 조회수 업데이트 실패해도 뉴스는 반환
    }

    return NextResponse.json({ 
      data: {
        ...data,
        view_count: (data.view_count || 0) + 1 // 업데이트된 조회수 반영
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}