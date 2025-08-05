import Image from 'next/image';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import styles from '../support.module.css'; // support.module.css 파일을 import

const DownloadComponent = () => {
  const DIR_ROOT = '/img'; // public 폴더 기준 경로
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "원격지원";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "고객지원", href: "/sub/company/" },
    { label: "원격지원" }
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
        <h2>원격지원</h2>
      </div>
      <div className={`${styles['content-body']} mt-37px`}>
            <div className={styles['remote-banner']}>
                <div className={styles['remote-banner-inner-wrapper']}>
                    <div className={styles['remote-banner-title']}>
                        <img src={`${DIR_ROOT}/icon-remote-banner.svg`} alt="원격지원" />
                        <span>원격지원 서비스란?</span>
                    </div>
                    <p className={styles['remote-banner-description']}>
                        원격 지원 서비스는 고객님의 요청에 따라 엔지니어가<br/>
                        고객님의 PC에 접속하여 기술지원을 해드리는 서비스 입니다.
                    </p>
                </div>
            </div>

            <div className={`${styles['sub-title-area']} justify-center mt-34px`}>
                <h3>진행 방법 안내</h3>
            </div>
            <div className={`${styles['remote-item-list']} mt-20px`}>
                <div className={styles['remote-item']} data-idx="1">
                    <div className={styles['remote-item-step-no']}>STEP 01</div>
                    <div className={`${styles['remote-item-title']} mt-10px`}><h4>엔지니어와<br/>상담을 요청합니다.</h4></div>
                    <span className={styles['remote-item-button']}>
                        <a href="inquiry.asp">상담 문의 요청하기</a>
                    </span>
                </div>
                <div className={styles['remote-item']} data-idx="2">
                    <div className={styles['remote-item-step-no']}>STEP 02</div>
                    <div className={`${styles['remote-item-title']} mt-10px`}><h4>아래 다운로드 버튼을 통해<br/>원격 프로그램을 실행합니다.</h4></div>
                    <span className={styles['remote-item-button']}>
                        <a href="https://download.teamviewer.com/download/TeamViewer_Setup_x64.exe">TeamViewer 다운로드 링크</a>
                    </span>
                </div>
                <div className={styles['remote-item']} data-idx="3">
                    <div className={styles['remote-item-step-no']}>STEP 03</div>
                    <div className={`${styles['remote-item-title']} mt-10px`}><h4>팀뷰어가 실행되면<br/>귀하의 ID와 PW를 알려주세요.</h4></div>
                    <a href="https://www.teamviewer.com/ko/global/support/knowledge-base/teamviewer-remote/remote-control/where-to-find-my-id-and-password/?" target="_blank"><span className={styles['remote-item-button']}>ID와 PW는 어떻게 확인하나요?</span></a>
                </div>
            </div>
      </div>
      </PageContentContainer>
    </div>
  );
};

export default DownloadComponent;

