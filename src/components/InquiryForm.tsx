'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type InquiryType = 'quote' | 'tech' | 'edu' | 'etc';

interface FormData {
  category: InquiryType;
  name: string;
  job_title: string;
  phone: string;
  company: string;
  email: string;
  product_name: string;
  contact_path: string;
  description: string;
  privacy: boolean;
}

const InquiryForm = () => {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<InquiryType>('quote');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category: 'quote',
    name: '',
    job_title: '',
    phone: '',
    company: '',
    email: '',
    product_name: '',
    contact_path: '',
    description: '',
    privacy: false
  });

  const categoryLabels = {
    quote: '견적 및 납기 문의',
    tech: '기술문의',
    edu: '교육문의',
    etc: '기타'
  };

  // URL 파라미터에서 products 값을 읽어서 product_name에 설정
  useEffect(() => {
    const productsParam = searchParams.get('products');
    if (productsParam) {
      setFormData(prev => ({
        ...prev,
        product_name: productsParam
      }));
    }
  }, [searchParams]);

  const handleCategorySelect = (category: InquiryType) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const form = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'privacy') {
          form.append(key, value ? 'on' : '');
        } else {
          form.append(key, value.toString());
        }
      });

      // Handle file attachment
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        form.append('attachment', fileInput.files[0]);
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        body: form
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          message: result.message || '문의가 성공적으로 등록되었습니다.'
        });
        
        // Reset form
        setFormData({
          category: 'quote',
          name: '',
          job_title: '',
          phone: '',
          company: '',
          email: '',
          product_name: '',
          contact_path: '',
          description: '',
          privacy: false
        });
        setSelectedCategory('quote');
        
        // Reset file input
        if (fileInput) {
          fileInput.value = '';
          const fileLabel = document.getElementById('fileLabel');
          if (fileLabel) fileLabel.textContent = '선택된 파일 없음';
        }
      } else {
        setSubmitMessage({
          type: 'error',
          message: result.error || '문의 등록 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage({
        type: 'error',
        message: '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // File input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileLabel = document.getElementById('fileLabel');
    if (fileLabel) {
      fileLabel.textContent = file ? file.name : '선택된 파일 없음';
    }
  };

  return (
    <form id="frm-support" onSubmit={handleSubmit} encType="multipart/form-data">
      {submitMessage && (
        <div className={`submit-message ${submitMessage.type}`} style={{
          padding: '15px',
          margin: '20px 0',
          borderRadius: '4px',
          backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
          color: submitMessage.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${submitMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {submitMessage.message}
        </div>
      )}

      <div className="button-category-list mt-37px" data-name="category">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <span 
            key={key}
            className={`button-category-item ${selectedCategory === key ? 'selected' : ''}`}
            data-id={key}
            onClick={() => handleCategorySelect(key as InquiryType)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{label}</h3>
          </span>
        ))}
      </div>

      <div className="form-row black-border-top mt-20px">
        <div className="form-item">
          <label htmlFor="name">이름</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-item">
          <label htmlFor="job_title">직함</label>
          <input 
            type="text" 
            id="job_title" 
            name="job_title" 
            placeholder="직함을 입력하세요"
            value={formData.job_title}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-row gray-border-top">
        <div className="form-item">
          <label htmlFor="phone">연락처</label>
          <input 
            type="text" 
            id="phone" 
            name="phone" 
            placeholder="'-'는 제외하고 입력해주세요"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-item">
          <label htmlFor="company">회사명</label>
          <input 
            type="text" 
            id="company" 
            name="company" 
            placeholder="회사명을 입력하세요"
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-row gray-border-top">
        <div className="form-item">
          <label htmlFor="email">이메일</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="이메일을 입력하세요"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-item">
          <label htmlFor="product_name">품명</label>
          <input 
            type="text" 
            id="product_name" 
            name="product_name" 
            placeholder="품명을 입력하세요"
            value={formData.product_name}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-row gray-border-top">
        <div className="form-item">
          <label htmlFor="contact_path">컨택 경로 </label>
          <select 
            id="contact_path" 
            name="contact_path" 
            required
            value={formData.contact_path}
            onChange={handleInputChange}
          >
            <option value="">선택하세요</option>
            <option value="newsletter">뉴스레터</option>
            <option value="google">구글</option>
            <option value="naver">네이버</option>
            <option value="webnews">웹뉴스</option>
            <option value="exhibition">전시회</option>
            <option value="etc">기타</option>
          </select>
        </div>
        <div className="form-item">
          {/* 빈 공간 */}
        </div>
      </div>

      <div className="form-row gray-border-top">
        <div className="form-item">
          <label htmlFor="description">상담내용 <span style={{ color: '#E92C1E' }}>*</span></label>
          <textarea 
            id="description" 
            name="description" 
            required
            placeholder="상담내용을 입력하세요"
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
          <p className="ext-description">
            <span style={{ color: '#E92C1E' }}>*</span> 표시는 필수 입력사항입니다.
          </p>
        </div>
      </div>

      <div className="form-row gray-border-top">
        <div className="form-item">
          <label htmlFor="attachment">파일첨부</label>
          <div className="file-input-container">
            <label id="fileLabel">선택된 파일 없음</label>
            <input 
              type="file" 
              id="fileInput" 
              name="attachment" 
              accept="image/gif,image/jpg,image/png,.pdf"
              onChange={handleFileChange}
            />
            <button type="button" className="file-button" onClick={() => document.getElementById('fileInput')?.click()}>
              파일 선택
            </button>
          </div>
          <p className="ext-description">5MB 이하의 gif, jpg, png, pdf 파일만 등록할 수 있습니다.</p>
        </div>
      </div>

      <div className="form-row gray-border-top">
        <div className="form-item">
          <label htmlFor="privacy">개인정보처리방침</label>
          <div className="privacy">
            <p>개인정보처리방침에 따라 수집된 정보는 문의 응답 목적으로만 사용되며, 관련 법령에 따라 적절히 관리됩니다.</p>
          </div>
          <p className="agree-privacy">
            <input 
              type="checkbox" 
              id="privacy" 
              name="privacy" 
              required
              checked={formData.privacy}
              onChange={handleInputChange}
            />
            위 내용을 읽었으며 동의합니다. <span style={{ color: '#E92C1E' }}>*</span>
          </p>
        </div>
      </div>

      <div className="form-row black-border-top">
        <div className="form-item mt-20px">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '문의 등록 중...' : '문의하기'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default InquiryForm;