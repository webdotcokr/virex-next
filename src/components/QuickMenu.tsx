'use client';

import { useEffect } from 'react';
// import './QuickMenu.css';

const QuickMenu = () => {
  useEffect(() => {
    const handleTopClick = (e: Event) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setActiveMenu = () => {
      const currentUrl = window.location.pathname;
      const menuItems = document.querySelectorAll('.quick-menu-item');
      
      menuItems.forEach((item) => {
        const element = item as HTMLElement;
        const pageName = element.dataset.page;
        element.classList.remove('active');
        
        if (pageName && pageName !== 'top') {
          if (currentUrl.includes(`/${pageName}`) || 
              currentUrl.includes(`/support/${pageName}`) ||
              (currentUrl.includes('/support/') && pageName === 'inquiry') ||
              (currentUrl.includes('blog.virex.co.kr') && pageName === 'knowledge')) {
            element.classList.add('active');
          }
        }
      });
    };

    const addTouchFeedback = () => {
      if ('ontouchstart' in window) {
        const menuItems = document.querySelectorAll('.quick-menu-item');
        menuItems.forEach((item) => {
          const element = item as HTMLElement;
          
          element.addEventListener('touchstart', () => {
            element.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
          });
          
          element.addEventListener('touchend', () => {
            element.style.backgroundColor = '';
          });
          
          element.addEventListener('touchcancel', () => {
            element.style.backgroundColor = '';
          });
        });
      }
    };

    const topBtn = document.getElementById('quick-top-btn');
    if (topBtn) {
      topBtn.addEventListener('click', handleTopClick);
    }

    setActiveMenu();
    addTouchFeedback();

    return () => {
      if (topBtn) {
        topBtn.removeEventListener('click', handleTopClick);
      }
    };
  }, []);

  return (
    <div className="quick-menu">
      <div className="quick-menu-item mobile-visible" data-page="inquiry">
        <div className="icon">
          <a href="/support/inquiry">
            <img className="desktop-only" src="/icon/icon-question.svg" alt="빠른 문의" />
            <img className="mobile-only" src="/icon/icon-question.svg" alt="빠른 문의" />
          </a>
        </div>
        <span>제품 문의</span>
      </div>
      <div className="quick-menu-divider"></div>

      <div className="quick-menu-item mobile-visible" data-page="knowledge">
        <div className="icon">
          <a href="https://blog.virex.co.kr">
            <img className="desktop-only" src="/icon/icon-tech.svg" alt="기술지식" />
            <img className="mobile-only" src="/icon/icon-tech.svg" alt="기술지식" />
          </a>
        </div>
        <span>기술지식</span>
      </div>
      <div className="quick-menu-divider"></div>

      <div className="quick-menu-item mobile-visible" data-page="blog">
        <div className="icon">
          <a href="https://blog.naver.com/virex_sales" target="_blank" rel="noopener noreferrer">
            <img src="/icon/icon-blog.svg" alt="블로그" />
          </a>
        </div>
        <span>블로그</span>
      </div>
      <div className="quick-menu-divider"></div>

      <div className="quick-menu-item desktop-only" data-page="top">
        <div className="icon">
          <a href="#" id="quick-top-btn">
            <img src="/icon/icon-top.svg" alt="맨위로" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickMenu;