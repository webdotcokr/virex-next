'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Inquiry {
  id: string
  inquiry_type: 'quote' | 'tech' | 'edu' | 'etc'
  name: string
  email: string
  company?: string
  phone?: string
  product_name?: string
  contact_path?: string
  description?: string
  status: 'pending' | 'contacted' | 'completed' | 'cancelled'
  created_at: string
  attachment_url?: string
}

export default function InquiriesPage() {
  const { user } = useAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const inquiryTypeLabels = {
    quote: '견적문의',
    tech: '기술문의',
    edu: '교육문의',
    etc: '기타'
  }

  const statusLabels = {
    pending: '접수',
    contacted: '처리중',
    completed: '완료',
    cancelled: '취소'
  }

  const statusColors = {
    pending: '#ffc107',
    contacted: '#007bff',
    completed: '#28a745',
    cancelled: '#6c757d'
  }

  // 문의내역 조회
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch('/api/mypage/inquiries')
        
        if (response.ok) {
          const data = await response.json()
          setInquiries(data.inquiries || [])
        } else {
          const errorData = await response.json()
          setError(errorData.error || '문의내역을 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('Error fetching inquiries:', err)
        setError('네트워크 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchInquiries()
  }, [user])

  // 필터링된 문의 목록
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    const matchesType = typeFilter === 'all' || inquiry.inquiry_type === typeFilter
    return matchesStatus && matchesType
  })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage)

  // 상세보기 모달 열기
  const openModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setShowModal(true)
  }

  // 상세보기 모달 닫기
  const closeModal = () => {
    setShowModal(false)
    setSelectedInquiry(null)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>문의내역을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
          문의내역
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          제품 문의 및 기술 지원 요청 내역을 확인하세요
        </p>
      </div>

      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* 필터 및 통계 */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 상태 필터 */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>상태:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="all">전체</option>
                <option value="pending">접수</option>
                <option value="contacted">처리중</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </div>

            {/* 유형 필터 */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>유형:</label>
              <select 
                value={typeFilter} 
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="all">전체</option>
                <option value="quote">견적문의</option>
                <option value="tech">기술문의</option>
                <option value="edu">교육문의</option>
                <option value="etc">기타</option>
              </select>
            </div>
          </div>

          {/* 총 문의 수 */}
          <div style={{ fontSize: '14px', color: '#666' }}>
            총 <strong>{filteredInquiries.length}건</strong>의 문의가 있습니다
          </div>
        </div>
      </div>

      {/* 문의 목록 테이블 */}
      {filteredInquiries.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            문의내역이 없습니다
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            아직 등록된 문의가 없습니다. 제품에 대한 궁금한 점이 있으시면 언제든 문의해주세요.
          </p>
          <a 
            href="/support/inquiry"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            새 문의하기
          </a>
        </div>
      ) : (
        <>
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #dee2e6' }}>
                    문의일자
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #dee2e6' }}>
                    유형
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #dee2e6' }}>
                    제품명
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #dee2e6' }}>
                    문의내용
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #dee2e6' }}>
                    상태
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #dee2e6' }}>
                    상세
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedInquiries.map((inquiry) => (
                  <tr key={inquiry.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: '#e3f2fd',
                        color: '#1565c0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {inquiryTypeLabels[inquiry.inquiry_type]}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      {inquiry.product_name || '-'}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '14px', maxWidth: '200px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap'
                      }}>
                        {inquiry.description || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: statusColors[inquiry.status] + '20',
                        color: statusColors[inquiry.status],
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {statusLabels[inquiry.status]}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => openModal(inquiry)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '8px',
              marginTop: '30px'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                  color: currentPage === 1 ? '#6c757d' : '#007bff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === page ? '#007bff' : 'white',
                    color: currentPage === page ? 'white' : '#007bff',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentPage === page ? '600' : '400'
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
                  color: currentPage === totalPages ? '#6c757d' : '#007bff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {/* 상세보기 모달 */}
      {showModal && selectedInquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: 0 }}>
                문의 상세정보
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>문의일자</label>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {new Date(selectedInquiry.created_at).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>상태</label>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: statusColors[selectedInquiry.status] + '20',
                    color: statusColors[selectedInquiry.status],
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {statusLabels[selectedInquiry.status]}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>문의유형</label>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {inquiryTypeLabels[selectedInquiry.inquiry_type]}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>제품명</label>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {selectedInquiry.product_name || '-'}
                  </div>
                </div>
              </div>

              {selectedInquiry.company && (
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>회사명</label>
                  <div style={{ fontSize: '16px', color: '#333' }}>{selectedInquiry.company}</div>
                </div>
              )}

              {selectedInquiry.phone && (
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>연락처</label>
                  <div style={{ fontSize: '16px', color: '#333' }}>{selectedInquiry.phone}</div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>문의내용</label>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#333', 
                  lineHeight: '1.6',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  {selectedInquiry.description || '-'}
                </div>
              </div>

              {selectedInquiry.contact_path && (
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>접촉경로</label>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {selectedInquiry.contact_path === 'newsletter' ? '뉴스레터' :
                     selectedInquiry.contact_path === 'google' ? '구글' :
                     selectedInquiry.contact_path === 'naver' ? '네이버' :
                     selectedInquiry.contact_path === 'webnews' ? '웹뉴스' :
                     selectedInquiry.contact_path === 'exhibition' ? '전시회' :
                     selectedInquiry.contact_path === 'etc' ? '기타' : selectedInquiry.contact_path}
                  </div>
                </div>
              )}

              {selectedInquiry.attachment_url && (
                <div>
                  <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>첨부파일</label>
                  <a 
                    href={selectedInquiry.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#007bff', 
                      textDecoration: 'none',
                      fontSize: '16px'
                    }}
                  >
                    첨부파일 다운로드
                  </a>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}