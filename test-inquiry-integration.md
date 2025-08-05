# 제품 문의 연동 기능 테스트 가이드

## 구현 완료 사항

1. **제품 페이지 (/products)**
   - 제품 비교 체크박스로 여러 제품 선택 가능
   - 선택된 제품의 part_number들이 추적됨

2. **제품문의 버튼 클릭 시**
   - 선택된 제품이 있을 경우: `/support/inquiry?products=ARL-22CH-12D,ARL-36CH-12D` 형태로 새 창 열림
   - 선택된 제품이 없을 경우: `/support/inquiry` 일반 문의 페이지로 새 창 열림

3. **문의 페이지 (/support/inquiry)**
   - URL 파라미터의 products 값이 자동으로 "품명" 입력란에 입력됨
   - 여러 제품이 콤마로 구분되어 표시됨

## 테스트 방법

1. http://localhost:3001/products 접속
2. 제품 목록에서 체크박스로 원하는 제품 선택 (여러 개 가능)
3. 우측 하단 플로팅 버튼 중 "제품문의" 버튼 클릭
4. 새 창으로 문의 페이지가 열리고 품명란에 선택한 제품의 part_number가 자동 입력됨

## 구현 세부사항

- **ProductsPage**: handleProductQuestion 함수에서 selectedProducts 배열을 콤마로 연결하여 URL 생성
- **FloatingActionButtons**: selectedProducts prop 추가하여 제품 정보 전달받음
- **InquiryForm**: useSearchParams로 URL 파라미터 읽어서 product_name 필드에 자동 설정