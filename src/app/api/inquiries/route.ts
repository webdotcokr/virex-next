import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const inquiryType = formData.get('category') as string;
    const name = formData.get('name') as string;
    const jobTitle = formData.get('job_title') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const email = formData.get('email') as string;
    const productName = formData.get('product_name') as string;
    const contactPath = formData.get('contact_path') as string;
    const description = formData.get('description') as string;
    const privacyAgreed = formData.get('privacy') === 'on';
    const attachment = formData.get('attachment') as File | null;

    // Debug log
    console.log('Form data received:', {
      inquiryType, name, email, contactPath, description, privacyAgreed,
      phone, company, jobTitle, productName
    });

    // Validation - only check truly required fields
    if (!name || !email || !phone || !company || !contactPath || !privacyAgreed) {
      return NextResponse.json(
        { error: '필수 입력 사항을 모두 작성해주세요. (이름, 이메일, 연락처, 회사명, 컨택경로, 개인정보처리방침 동의)' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Handle file upload if present
    let attachmentUrl = null;
    if (attachment && attachment.size > 0) {
      // Check file size (5MB limit)
      if (attachment.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: '파일 크기는 5MB 이하만 업로드 가능합니다.' },
          { status: 400 }
        );
      }

      // Check file type
      const allowedTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(attachment.type)) {
        return NextResponse.json(
          { error: 'gif, jpg, png, pdf 파일만 업로드 가능합니다.' },
          { status: 400 }
        );
      }

      // TODO: 파일 업로드 기능 구현 예정
      // Supabase Storage 또는 외부 서비스를 사용하여 파일 업로드 구현
      // 예시 코드:
      // const { data, error } = await supabase.storage
      //   .from('inquiries')
      //   .upload(`${Date.now()}-${attachment.name}`, attachment)
      // if (!error) attachmentUrl = data.path
      attachmentUrl = null; // 임시 비활성화
    }

    // Create Supabase client
    let supabase;
    try {
      supabase = createClient();
      console.log('Supabase client created successfully');
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Insert inquiry into database
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        inquiry_type: inquiryType || 'quote',
        name,
        job_title: jobTitle || null,
        phone,
        company,
        email,
        product_name: productName || null,
        contact_path: contactPath,
        message: description, // Using existing message field
        description,
        attachment_url: attachmentUrl,
        privacy_agreed: privacyAgreed,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: '문의 등록 중 오류가 발생했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // Send email notification
    try {
      const { sendContactNotification } = await import('@/lib/email-server')
      await sendContactNotification({
        company,
        name,
        phone,
        email,
        jobTitle,
        productName,
        contactPath,
        inquiryType,
        description
      })
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
      // Don't fail the API call if email fails
    }

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 등록되었습니다.',
      data: data
    });

  } catch (error) {
    console.error('API error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다. 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}