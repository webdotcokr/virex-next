import Image from 'next/image';
import PageContentContainer from '@/components/PageContentContainer';
import KakaoMap from '@/components/KakaoMap';
import styles from '../company.module.css'; // CSS 모듈 import
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오시는 길 | 바이렉스',
  description: '바이렉스 본사 위치 및 연락처 안내',
};

const LocationPage = () => {
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "바이렉스";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "바이렉스"},
    { label: "오시는 길" }
  ];

  return (
    <>
      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-company.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
        <div className={`${styles['companyContainer']} ${styles['flex-col']}`} data-page="location">
          <div className="content-title mt-16px">
            <h2>오시는 길</h2>
          </div>
          <div className={`${styles['location-container']} mt-37px`}>
            {/* 카카오맵 - 지도퍼가기 */}
            <KakaoMap timestamp="1755087549711" mapKey="6x39wg76qar" />

            <div className={`${styles['location-details']} mt-40px`}>
              <div className={styles['left-items']}>
                <div className={styles['location-detail-item']}>
                  <div className={styles['location-detail-item-icon']}>
                    <Image src="/img/icon-address.svg" alt="Address" width={16} height={16} />
                  </div>
                  <div className={styles['location-detail-item-type']}>
                    <h3>Address</h3>
                  </div>
                  <div className={styles['location-detail-item-value']}>
                    <h4>
                      경기도 안양시 동안구 흥안대로 427번길38, 1214호<br/>
                      (관양동, 인덕원성지스타위드)
                    </h4>
                  </div>
                </div>
              </div>
              <div className={`${styles['right-items']} flex-row`}>
                <div className={styles['location-detail-item']}>
                  <div className={styles['location-detail-item-icon']}>
                    <Image src="/img/icon-phone.svg" alt="Tel" width={16} height={16} />
                  </div>
                  <div className={styles['location-detail-item-type']}>
                    <h3>Tel</h3>
                  </div>
                  <div className={styles['location-detail-item-value']}>
                    <h4>070-5055-3330</h4>
                  </div>
                </div>
                <div className={styles['location-detail-item']}>
                  <div className={styles['location-detail-item-icon']}>
                    <Image src="/img/icon-fax.svg" alt="Fax" width={16} height={16} />
                  </div>
                  <div className={styles['location-detail-item-type']}>
                    <h3>Fax</h3>
                  </div>
                  <div className={styles['location-detail-item-value']}>
                    <h4>070-8233-5445</h4>
                  </div>
                </div>
                <div className={styles['location-detail-item']}>
                  <div className={styles['location-detail-item-icon']}>
                    <Image src="/img/icon-email-gray.svg" alt="E-mail" width={16} height={16} />
                  </div>
                  <div className={styles['location-detail-item-type']}>
                    <h3>E-mail</h3>
                  </div>
                  <div className={styles['location-detail-item-value']}>
                    <h4>ts@virex.co.kr</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContentContainer>

    </>
  );
};

export default LocationPage;
