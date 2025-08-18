import { Suspense } from 'react';
import PageContentContainer from '@/components/PageContentContainer';
import InquiryForm from '@/components/InquiryForm';

const CompanyPage = () => {
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "고객지원";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "고객지원"},
    { label: "제품문의" }
  ];

  return (
    <div>
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
        <Suspense fallback={<div>Loading...</div>}>
          <InquiryForm />
        </Suspense>
      </div>
      </PageContentContainer>
    </div>
  );
};

export default CompanyPage;
