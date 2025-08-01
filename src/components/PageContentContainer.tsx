import { BreadcrumbItem } from '@/types/breadcrumb';

interface PageContentContainerProps {
  backgroundClass?: string;
  backgroundImage?: string;
  breadcrumbs: BreadcrumbItem[];
  titleEn: string;
  titleKo: string;
  children?: React.ReactNode;
}

export default function PageContentContainer({
  backgroundClass = "company-header-background",
  backgroundImage,
  breadcrumbs,
  titleEn,
  titleKo,
  children
}: PageContentContainerProps) {
  const containerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover'
  } : undefined;

  const containerClassName = backgroundImage ? undefined : backgroundClass;

  return (
    <>
      <div 
        id="page-content-container" 
        className={containerClassName}
        style={containerStyle}
      >
        <div id="page-content">
          <div id="breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={index}>
                {item.href ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <span className="active">{item.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="arrow">
                    <img src="/icon/icon-breadcrumb-arrow.svg" alt="arrow" />
                  </span>
                )}
              </span>
            ))}
          </div>
          <div className="left-aligned">
            <div className="page-title-en">{titleEn}</div>
            <div className="page-title-ko">
              <h1>{titleKo}</h1>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}