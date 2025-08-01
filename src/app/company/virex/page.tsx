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
    { label: "회사소개" }
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

      {/* 기존 className들을 styles 객체를 사용하도록 수정 */}
      <div className={styles['content-body']}>
        <div class="content-title"><h2>회사소개</h2></div>
        <div className={`${styles['company-content-wrapper']} mt-84px`}>
          <div className={styles['company-title-bg']}>About</div>
          <div className={styles['company-title']}>
            <h3>
              바이렉스는 최적의 비전 시스템 구축을<br />
              함께하는 <span className="purple">혁신적 파트너</span>입니다.
            </h3>
          </div>
          <p className={styles['company-extra']}>
            바이렉스는 Teledyne Dalsa, FLIR의 국내 공식 대리점이자<br />
            CIS 카메라 특화 솔루션 기업으로, 고객 맞춤형 비전 시스템을 제공합니다.<br />
            우리는 전 세계 주요 제조사들과의 파트너십을 바탕으로, 카메라, 프레임 그래버, 렌즈, 조명, 영상 처리 라이브러리,<br />
            케이블 등 산업용 비전 광학계 및 시스템 전반의 최적의 솔루션을 제공합니다.<br />
            하지만, 단순히 하드웨어를 공급하는 것을 넘어, 고객의 비전 시스템을 완성하는 데<br />
            필요한 모든 것을 함께 고민하고 해결하는 파트너가 되는 것이 우리의 목표입니다.
          </p>
        </div>
        <div className={`${styles['company-content-wrapper']} mt-176px`}>
          <div className={styles['company-title-bg']}>Mission</div>
          <div className={styles['slogan-title']}>
            Leading your vision to success
          </div>
          <picture>
            <source srcSet={`${DIR_ROOT}/img/virex-content-02.jpg`} media="(min-width: 768px)" />
            <img src={`${DIR_ROOT}/img/mo/virex-content-02.jpg`} alt="virex-content-02" />
          </picture>
        </div>
      </div>

      <div className={`${styles['content-body']} full-width mt-112px`}>
        <div className={styles['company-content-rounded-gray-background']}></div>
        <div className={`${styles['company-content-wrapper']} mt-140px`}>
          <div className={`${styles['company-title-bg']} ${styles.darker}`}>Management</div>
          <div className={styles['company-title']}>
            <h3><span className="purple">경영철학,</span> 우리는 이렇게 생각합니다</h3>
          </div>
                      <div class="company-content-grid-container mt-40px">
                <div class="grid-item-container">
                    <div class="company-content-grid-item grid-image"><img src="<%=DIR_ROOT%>/img/company/virex-content-04-01.png" /></div>
                    <div class="company-content-grid-item grid-text-with-icon">
                        <div><img src="<%=DIR_ROOT%>/img/company/virex-content-04-01-icon.svg"/></div>
                        <div class="grid-text-title">
                            <h4>우리의 소중한 시간을<br/>
                            더 가치 있고 의미 있게 만드는 곳</h4>
                        </div>
                        <div class="grid-text-desc">
                            바이렉스에서 함께하는 시간이 의미 있는 경험이 되고,<br/>
                            성장으로 이어지도록 고민하며 아낌없이 지원하겠습니다.
                        </div>
                    </div>
                </div>
                
                <div class="grid-item-container">
                    <div class="company-content-grid-item grid-text-with-icon">
                        <img class="grid-icon" src="<%=DIR_ROOT%>/img/company/virex-content-04-02-icon.svg"/>
                        <div class="grid-text-title">
                            <h4>행복한 사람이<br/>
                            최고의 결과를 만든다!</h4>
                        </div>
                        <div class="grid-text-desc">
                            일의 의미를 찾고 몰입할 수 있어야,<br/>
                            고객에게도 최고의 가치를 제공합니다. 
                        </div>
                    </div>
                    <div class="company-content-grid-item grid-image"><img src="<%=DIR_ROOT%>/img/company/virex-content-04-02.png" /></div>
                </div>
                
                <div class="grid-item-container">
                    <div class="company-content-grid-item grid-image"><img src="<%=DIR_ROOT%>/img/company/virex-content-04-03.png" /></div>
                    <div class="company-content-grid-item grid-text-with-icon">
                        <img class="grid-icon" src="<%=DIR_ROOT%>/img/company/virex-content-04-03-icon.svg"/>
                        <div class="grid-text-title">
                            <h4>학벌, 나이, 성별 상관없어요!<br/>
                            인성과 태도</h4>
                        </div>
                        <div class="grid-text-desc">
                            학벌, 나이, 성별보다 올바른 인성과<br/>
                            협업하는 자세가 가장 큰 경쟁력입니다.
                        </div>
                    </div>
                </div>
                
                <div class="grid-item-container">
                    <div class="company-content-grid-item grid-text-with-icon">
                        <div><img src="<%=DIR_ROOT%>/img/company/virex-content-04-04-icon.svg"/></div>
                        <div class="grid-text-title">
                            <h4>최고의 복지는<br/>
                            최고의 동료와 함께하는 것</h4>
                        </div>
                        <div class="grid-text-desc">
                            뛰어난 동료들과 함께 배우고<br/>
                            성장할 수 있는 환경을 만들어갑니다.
                        </div>
                    </div>
                    <div class="company-content-grid-item grid-image"><img src="<%=DIR_ROOT%>/img/company/virex-content-04-04.png" /></div>
                </div>
            </div>
        </div>

        <div className={`${styles['company-content-wrapper']} mt-232px`}>
          <div className={styles['company-title-bg']}><h3>Core Value</h3></div>
          <div className={styles['company-title']}>
            우리의 핵심 가치인 <span className="purple">고객성공, 성장, 소통, 원팀</span>을 바탕으로,<br />
            우리는 이렇게 일해요
          </div>
                      <div class="company-content-card-list">
                <div class="company-content-card-item" data-idx="1">
                    <div class="base-content text-wrapper">
                        <div class="txt-s">Success</div>
                        <div class="txt-xl"><h4>고객 성공</h4></div>
                        <div class="txt-m">고객이 잘 되면 우리도 잘 된다!</div>
                        <span class="right-arrow">
                            <img src="<%=DIR_ROOT%>/img/icon-right-arrow-white.svg" alt="right-arrow" />
                        </span>
                    </div>
                    <div class="onhover-content">
                        <div class="text-wrapper">
                            <div class="txt-l">고객 성공</div>
                            <div class="txt-m">고객이 잘 되면 우리도 잘 된다!</div>
                        </div>
                        <div class="text-wrapper">
                            <div>
                                <div class="txt-sb">01</div>
                                <div class="txt-ms">고객 만족이 최우선! 고객이 원하는 걸 먼저 파악하고, 기대 이상으로 해결해줍니다.</div>
                                <div class="txt-sb">02</div>
                                <div class="txt-ms">그냥 팔고 끝? NO! 고객이 우리 서비스를 쓰면서 진짜로 성공할 수 있도록 돕습니다.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="company-content-card-item" data-idx="2">
                    <div class="base-content text-wrapper">
                        <div class="txt-s">Growth</div>
                        <div class="txt-xl"><h4>성장</h4></div>
                        <div class="txt-m">끊임없이 배우고 레벨 업!</div>
                        <span class="right-arrow">
                            <img src="<%=DIR_ROOT%>/img/icon-right-arrow-white.svg" alt="right-arrow" />
                        </span>
                    </div>
                    <div class="onhover-content">
                        <div class="text-wrapper">
                            <div class="txt-l">성장</div>
                            <div class="txt-m">끊임없이 배우고 레벨 업!</div>
                        </div>
                        <div class="text-wrapper">
                            <div class="txt-sb">01</div>
                            <div class="txt-ms">가만히 있으면 가마니!<br/>스스로 돌아보고 계속 발전해 나갑니다.</div>
                            <div class="txt-sb">02</div>
                            <div class="txt-ms">빠르게 도전하고, 작은 실패에서 배우며 더 크게 성장합니다.</div>
                            <div class="txt-sb">03</div>
                            <div class="txt-ms">피드백은 성장의 비타민! 아픈 말도 감사하게 듣고, 실력으로 증명합니다.</div>
                        </div>
                    </div>
                </div>
                <div class="company-content-card-item" data-idx="3">
                    <div class="base-content text-wrapper">
                        <div class="txt-s">Communication</div>
                        <div class="txt-xl"><h4>소통</h4></div>
                        <div class="txt-m">솔직하게, 가감 없이 이야기하기!</div>
                        <span class="right-arrow">
                            <img src="<%=DIR_ROOT%>/img/icon-right-arrow-white.svg" alt="right-arrow" />
                        </span>
                    </div>
                    <div class="onhover-content">
                        <div class="text-wrapper">
                            <div class="txt-l">소통</div>
                            <div class="txt-m">솔직하고, 가감 없이 이야기하기!</div>
                        </div>
                        <div class="text-wrapper">
                            <div class="txt-sb">01</div>
                            <div class="txt-ms">눈치 보지 않고, 누구나 의견 낼 수 있는 문화!<br/>중요한 건 직급이 아니라 '좋은 의견'입니다.</div>
                            <div class="txt-sb">02</div>
                            <div class="txt-ms">"이거 좀 별로인데?"라고 솔직하게 말할 수 있어야 진짜 발전할 수 있어요.</div>
                            <div class="txt-sb">03</div>
                            <div class="txt-ms">서로 배려하되 돌려 말하지 않기! 핵심을 찌르는 피드백이 더 빠른 성장을 만듭니다.</div>
                        </div>
                    </div>
                </div>
                <div class="company-content-card-item" data-idx="4">
                    <div class="base-content text-wrapper">
                        <div class="txt-s">One Team</div>
                        <div class="txt-xl"><h4>원팀</h4></div>
                        <div class="txt-m">같이 가야 멀리 간다!</div>
                        <span class="right-arrow">
                            <img src="<%=DIR_ROOT%>/img/icon-right-arrow-white.svg" alt="right-arrow" />
                        </span>
                    </div>
                    <div class="onhover-content">
                        <div class="text-wrapper">
                            <div class="txt-l">원팀</div>
                            <div class="txt-m">같이 가야 멀리 간다!</div>
                        </div>
                        <div class="text-wrapper">
                            <div class="txt-sb">01</div>
                            <div class="txt-ms">규칙보다 중요한 건 책임감! 각자 맡은 일은 끝까지 주도적으로 해냅니다.</div>
                            <div class="txt-sb">02</div>
                            <div class="txt-ms">팀원 간 신뢰를 바탕으로 서로 도와주고 함께 목표를 이루는게 진짜 원팀.</div>
                            <div class="txt-sb">03</div>
                            <div class="txt-ms">경쟁보단 협력! 각자의 강점을 살려 시너지를 내는 게 더 중요합니다.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className={styles['company-virex-join-section']}>
        <div className={styles['company-virex-join-container']}>
          <div className={styles['company-virex-join-image']}>
            <picture>
              <source srcSet={`${DIR_ROOT}/img/virex-content-06.png`} media="(min-width: 768px)" />
              <img src={`${DIR_ROOT}/img/mo/virex-content-06.png`} alt="바이렉스와 함께하세요" />
            </picture>
            <Link href={`${DIR_ROOT}/sub/recruit/`} className={styles['recruit-button']}>
              2025 채용공고 바로가기
            </Link>
          </div>
        </div>
      </div>
      </PageContentContainer>
      </div>
  );
};

export default CompanyPage;
