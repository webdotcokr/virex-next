import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';

const CompanyPage = () => {
  const DIR_ROOT = ''; // public 폴더 기준 경로
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "고객지원";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "고객지원", href: "/Su/company/" },
    { label: "제품문의" }
  ];

  return (
    <div>
      <Head>
        <title>{`회사소개 | 바이렉스`}</title>
      </Head>

      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
      <div className="content-title">
        <h2>제품문의</h2>
      </div>
      <div className="content-body">
        <form id="frm-support" method="post" encType="multipart/form-data">
  <input type="hidden" name="category" value="quote" />

  <div className="button-category-list mt-37px" data-name="category">
    <span className="button-category-item selected" data-id="quote">
      <h3>견적 및 납기 문의</h3>
    </span>
    <span className="button-category-item" data-id="tech">
      <h3>기술문의</h3>
    </span>
    <span className="button-category-item" data-id="edu">
      <h3>교육문의</h3>
    </span>
    <span className="button-category-item" data-id="etc">
      <h3>기타</h3>
    </span>
  </div>

  <div className="form-row black-border-top mt-20px">
    <div className="form-item">
      <label htmlFor="name">이름</label>
      <input type="text" id="name" name="name" required placeholder="이름을 입력하세요" />
    </div>
    <div className="form-item">
      <label htmlFor="job_title">직함</label>
      <input type="text" id="job_title" name="job_title" placeholder="직함을 입력하세요" />
    </div>
  </div>
  <div className="form-row gray-border-top">
    <div className="form-item">
      <label htmlFor="phone">연락처</label>
      <input type="text" id="phone" name="phone" required placeholder="'-'는 제외하고 입력해주세요" />
    </div>
    <div className="form-item">
      <label htmlFor="company">회사명</label>
      <input type="text" id="company" name="company" required placeholder="회사명을 입력하세요" />
    </div>
  </div>
  <div className="form-row gray-border-top">
    <div className="form-item">
      <label htmlFor="email">이메일</label>
      <input type="email" id="email" name="email" required placeholder="이메일을 입력하세요" />
    </div>
    <div className="form-item">
      <label htmlFor="product_name">품명</label>
      <input type="text" id="product_name" name="product_name" placeholder="품명을 입력하세요" />
    </div>
  </div>
  <div className="form-row gray-border-top">
    <div className="form-item">
      <label htmlFor="contact_path">컨택 경로</label>
      <select id="contact_path" name="contact_path" required>
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
      <textarea id="description" name="description" placeholder="상담내용을 입력하세요"></textarea>
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
        <input type="file" id="fileInput" name="attachment" accept="image/gif,image/jpg,image/png,.pdf" />
        <button className="file-button">파일 선택</button>
      </div>
      <p className="ext-description">5MB 이하의 gif, jpg, png, pdf 파일만 등록할 수 있습니다.</p>
    </div>
  </div>
  <div className="form-row gray-border-top">
    <div className="form-item">
      <label htmlFor="privacy">개인정보처리방침</label>
      <div className="privacy">
        {/* 개인정보처리방침 내용은 별도의 컴포넌트로 분리하거나 직접 내용을 삽입해야 합니다. */}
        {/* <PrivacyPolicyComponent /> */}
      </div>
      <p className="agree-privacy">
        <input type="checkbox" id="privacy" name="privacy" required />
        위 내용을 읽었으며 동의합니다.
      </p>
    </div>
  </div>
  <div className="form-row black-border-top">
    <div className="form-item mt-20px">
      <button type="submit" className="btn-submit">문의하기</button>
    </div>
  </div>
</form>
      </div>
      </PageContentContainer>
            </div>
  );
};

export default CompanyPage;
