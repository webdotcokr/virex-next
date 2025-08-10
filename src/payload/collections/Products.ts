import type { CollectionConfig } from 'payload'

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'part_number',
    defaultColumns: ['part_number', 'category', 'maker', 'series_id', 'is_active'],
    group: '제품 관리',
    description: '카테고리별 분리된 제품 테이블을 통합 관리하는 Virtual Collection입니다.',
  },
  // Virtual Collection - 실제 테이블이 아닌 인터페이스 역할
  disableDuplicate: true,
  fields: [
    // 카테고리 선택 - 이에 따라 동적 필드가 결정됨
    {
      name: 'category_selection',
      type: 'relationship',
      relationTo: 'categories',
      label: '제품 카테고리',
      required: true,
      admin: {
        description: '제품 카테고리를 먼저 선택하면 해당 카테고리의 스펙 필드가 표시됩니다.',
      },
    },
    // 기본 제품 정보
    {
      name: 'part_number',
      type: 'text',
      label: 'Part Number',
      required: true,
      unique: true,
      admin: {
        description: '제품의 고유 부품 번호',
      },
    },
    {
      name: 'maker',
      type: 'text',
      label: '제조사',
      admin: {
        description: '제조사명 (makers 테이블과 연동)',
      },
    },
    {
      name: 'series_id',
      type: 'number',
      label: 'Series ID',
      admin: {
        description: 'series 테이블의 ID',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: '활성 상태',
      defaultValue: true,
    },
    {
      name: 'is_new',
      type: 'checkbox',
      label: '신제품 여부',
      defaultValue: false,
    },
    {
      name: 'image_url',
      type: 'text',
      label: '제품 이미지 URL',
    },
    // 동적 스펙 필드 - JSONB 형태로 저장
    {
      name: 'specifications',
      type: 'json',
      label: '제품 사양',
      admin: {
        description: '카테고리별 제품 사양을 JSON 형태로 입력하세요.',
      },
    },
    // 카테고리별 동적 필드 렌더링을 위한 조건부 필드들
    {
      name: 'cis_specs',
      type: 'group',
      label: 'CIS 제품 사양',
      admin: {
        condition: (data) => {
          // 카테고리가 CIS인 경우에만 표시
          return false // 실제로는 category_selection 값에 따라 조건 설정
        },
        description: 'Contact Image Sensor 제품 전용 사양',
      },
      fields: [
        {
          name: 'scan_width',
          type: 'text',
          label: 'Scan Width (mm)',
        },
        {
          name: 'dpi',
          type: 'number',
          label: 'DPI',
        },
        {
          name: 'resolution',
          type: 'number',
          label: 'Resolution',
        },
        {
          name: 'pixel_size',
          type: 'text',
          label: 'Pixel Size (μm)',
        },
        {
          name: 'speed',
          type: 'text',
          label: 'Speed (MHz)',
        },
      ],
    },
    {
      name: 'line_specs',
      type: 'group',
      label: 'Line Scan 제품 사양',
      admin: {
        condition: (data) => false, // 실제로는 동적 조건 설정
        description: 'Line Scan Camera 제품 전용 사양',
      },
      fields: [
        {
          name: 'line_rate',
          type: 'number',
          label: 'Line Rate (kHz)',
        },
        {
          name: 'resolution',
          type: 'number',
          label: 'Resolution',
        },
        {
          name: 'pixel_size',
          type: 'text',
          label: 'Pixel Size (μm)',
        },
        {
          name: 'interface',
          type: 'select',
          label: 'Interface',
          options: [
            { label: 'GigE', value: 'gige' },
            { label: 'USB3', value: 'usb3' },
            { label: 'CoaXPress', value: 'coaxpress' },
          ],
        },
      ],
    },
    // 메타데이터
    {
      name: 'metadata',
      type: 'group',
      label: '메타데이터',
      fields: [
        {
          name: 'table_source',
          type: 'text',
          label: '원본 테이블',
          admin: {
            readOnly: true,
            description: '이 제품이 저장된 실제 데이터베이스 테이블명',
          },
        },
        {
          name: 'last_sync',
          type: 'date',
          label: '마지막 동기화',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
  timestamps: true,
  // Custom hooks for handling category-specific tables
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        // 실제 데이터베이스 작업 전 처리 로직
        console.log(`Product ${operation} operation triggered`)
      },
    ],
    afterOperation: [
      ({ operation, result, req }) => {
        // 실제 데이터베이스 작업 후 처리 로직
        console.log(`Product ${operation} completed`)
      },
    ],
  },
}

export default Products