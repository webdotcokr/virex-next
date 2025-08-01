import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import styles from '../company.module.css'; // CSS 모듈 import

const CompanyPage = () => {
  const DIR_ROOT = ''; // public 폴더 기준 경로
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "바이렉스";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "바이렉스", href: "/sub/company/" },
    { label: "오시는 길" }
  ];

  return (
    <div>
      <Head>
        <title>{`회사소개 | 바이렉스`}</title>
      </Head>

      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-company.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
      <div className={`${styles['container']} ${styles['flex-col']}`} data-page="global-partners">
      <div className="content-title">
        <h2>파트너사</h2>
      </div>
      <div className={`${styles['content-subtitle']} mt-14px`}>
        글로벌 선두 파트너사들과 함께
        <br />
        귀사에 최적의 솔루션을 제안합니다.
      </div>
      <div className={`${styles['content-body']} mt-30px`}>
      </div>
      </div>
      </PageContentContainer>
    </div>
  );
};

export default CompanyPage;
