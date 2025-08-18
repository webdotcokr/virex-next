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
            required
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
            required
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
          <label htmlFor="description">상담내용</label>
          <textarea 
            id="description" 
            name="description" 
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
                        <p>바이렉스 (이하 '회사')는 고객님의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다. 회사는 개인정보취급방침을 개정하는 경우 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다.</p>
<p>ο 본 방침은 2018년부터 시행됩니다.</p>
<dl>
    <dt>수집하는 개인정보 항목</dt>
        <dd>회사는 회원가입, 상담, 서비스 신청 등등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
            <ul>
                <li>ο 수집항목 : 이름 , 로그인ID , 비밀번호 , 자택 전화번호 , 자택 주소 , 휴대전화번호 , 접속 로그</li>
                <li>ο 개인정보 수집방법 : 홈페이지(회원가입) , 배송 요청</li>
            </ul>
        </dd>
</dl>
<dl>
    <dt>개인정보의 수집 및 이용목적</dt>
        <dd>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
            <ul>
                <li>ο 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산구매 및 요금 결제</li>
                <li>ο 회원 관리 - 회원제 서비스 이용에 따른 본인확인</li>
            </ul>
        </dd>	
</dl>
<dl>
    <dt>개인정보의 보유 및 이용기간</dt>
        <dd>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
            <div className="sTxt">
                <b>가. 회사 내부 방침에 의한 정보보유 사유</b>
                <dl>
                    <dt>- 부정이용기록</dt>
                        <dd>보존 이유 : 부정 이용 방지</dd>
                        <dd>보존 기간 : 1년</dd>
                </dl>
                <b>나. 관련법령에 의한 정보보유 사유</b>
                <p>상법, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다. 이 경우 회사는 보관하는 정보를 그 보관의 목적으로만 이용하며 보존기간은 아래와 같습니다.</p>
                <dl>
                    <dt>- 계약 또는 청약철회 등에 관한 기록</dt>
                        <dd>보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률</dd>
                        <dd>보존 기간 : 5년</dd>
                </dl>
                <dl>
                    <dt>- 대금결제 및 재화 등의 공급에 관한 기록</dt>
                        <dd>보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률</dd>
                        <dd>보존 기간 : 5년</dd>
                </dl>
                <dl>
                    <dt>- 전자금융 거래에 관한 기록</dt>
                        <dd>보존 이유 : 전자금융거래법</dd>
                        <dd>보존 기간 : 5년</dd>
                </dl>
                <dl>
                    <dt>- 소비자의 불만 또는 분쟁처리에 관한 기록</dt>
                        <dd>보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률</dd>
                        <dd>보존 기간 : 3년</dd>
                </dl>
            </div>
        </dd>
</dl>
<dl>
    <dt>개인정보의 파기절차 및 방법</dt>
        <dd>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.
            <ul>
                <li>ο 파기절차
                    <p>회원님이 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기되어집니다.<br />	별도 DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 보유되어지는 이외의 다른 목적으로 이용되지 않습니다.</p>
                </li>
                <li>ο 파기방법
                    <p>- 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
                    <p>- 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</p>
                </li>
            </ul>
        </dd>	
</dl>
<dl>
    <dt>개인정보 제공</dt>
        <dd>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
            <ul>
                <li>- 제품 배송 또는 설치 및 A/S에 필요로 하는 경우 (이름, 휴대전화번호, 설치지역 주소)</li>
                <li>- 이용자들이 사전에 동의한 경우</li>
                <li>- 제품 배송 또는 설치 및 A/S에 필요로 하는 경우 (이름, 휴대전화번호, 설치지역 주소)</li>
            </ul>
        </dd>	
</dl>
<dl>
    <dt>수집한 개인정보의 위탁</dt>
        <dd>회사는 고객님의 동의없이 고객님의 정보를 회사와 계약된 배송,설치,A/S 업체 외의 외부 업체에 위탁하지 않습니다. 향후 그러한 필요가 생길 경우, 위탁 대상자와 위탁 업무 내용에 대해 고객님에게 통지하고 필요한 경우 사전 동의를 받도록 하겠습니다.</dd>	
</dl>
<dl>
    <dt>이용자 및 법정대리인의 권리와 그 행사방법</dt>
        <dd>이용자 및 법정 대리인은 언제든지 등록되어 있는 자신 혹은 당해 만 14세 미만 아동의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다.<br />이용자 혹은 만 14세 미만 아동의 개인정보 조회/수정을 위해서는 '개인정보변경'(또는 '회원정보수정' 등)을 가입해지(동의철회)를 위해서는 "회원탈퇴"를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.<br />혹은 개인정보관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체없이 조치하겠습니다.<br />귀하가 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다.<br /><br />또한 잘못된 개인정보를 제3자에게 이미 제공한 경우에는 정정 처리결과를 제3자에게 지체없이 통지하여 정정이 이루어지도록 하겠습니다.<br />회사는 이용자 혹은 법정 대리인의 요청에 의해 해지 또는 삭제된 개인정보는 "회사가 수집하는 개인정보의 보유 및 이용기간"에 명시된 바에 따라 처리하고 그 외의용도로 열람 또는 이용할 수 없도록 처리하고 있습니다.</dd>	
</dl>
<dl>
    <dt>개인정보 자동수집 장치의 설치, 운영 및 그 거부에 관한 사항</dt>
        <dd>회사는 귀하의 정보를 수시로 저장하고 찾아내는 '쿠키(cookie)' 등을 운용합니다. 쿠키란 회사의 웹사이트를 운영하는데 이용되는 서버가 귀하의 브라우저에 보내는 아주 작은 텍스트 파일로서 귀하의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키를 사용합니다.
        <ul>
            <li>▶ 쿠키 등 사용 목적
                <p>회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공<br />귀하는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 귀하는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</p>
            </li>
            <li>▶ 쿠키 설정 거부 방법
                <p>예: 쿠키 설정을 거부하는 방법으로는 회원님이 사용하시는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.<br />설정방법 예(인터넷 익스플로어의 경우): 웹 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보<br />단, 귀하께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.</p>
            </li>
        </ul>
        </dd>	
</dl>
<dl>
    <dt>개인정보에 관한 민원서비스</dt>
        <dd>회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보관리책임자를 지정하고 있습니다.
            <div className="sTxt">
                <b>개인정보관리책임자</b>
                <dl>
                    <dd>성   명 : 관리자</dd>
                    <dd>전자우편 : admin@admin.com</dd>
                    <dd>전화번호 :</dd>
                </dl>
            </div>
        </dd>	
</dl>
<p>귀하께서는 회사의 서비스를 이용하시며 발생하는 모든 개인정보보호 관련 민원을 개인정보관리책임자 혹은 담당부서로 신고하실 수 있습니다. 회사는 이용자들의 신고사항에 대해 신속하게 충분한 답변을 드릴 것입니다.</p>
<dl>
    <dd>기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
        <ul>
            <li>1.개인분쟁조정위원회 (www.1336.or.kr/1336)</li>
            <li>2.정보보호마크인증위원회 (www.eprivacy.or.kr/02-580-0533~4)</li>
            <li>3.대검찰청 인터넷범죄수사센터 (http://icic.sppo.go.kr/02-3480-3600)</li>
            <li>4.경찰청 사이버테러대응센터 (www.ctrc.go.kr/02-392-0330)</li>
        </ul>
    </dd>	
</dl>
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