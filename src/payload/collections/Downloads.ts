import type { CollectionConfig } from 'payload'

const Downloads: CollectionConfig = {
  slug: 'downloads',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'file_type', 'member_only', 'download_count'],
    group: '콘텐츠 관리',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '다운로드 제목',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '설명',
    },
    {
      name: 'category',
      type: 'select',
      label: '카테고리',
      options: [
        { label: 'Software', value: 'software' },
        { label: 'Driver', value: 'driver' },
        { label: 'Manual', value: 'manual' },
        { label: 'Catalog', value: 'catalog' },
        { label: 'Datasheet', value: 'datasheet' },
        { label: 'Application Note', value: 'application_note' },
      ],
      required: true,
    },
    {
      name: 'file_url',
      type: 'text',
      label: '파일 URL',
      required: true,
      admin: {
        description: '다운로드 파일의 URL 또는 경로',
      },
    },
    {
      name: 'file_name',
      type: 'text',
      label: '파일명',
      required: true,
    },
    {
      name: 'file_size',
      type: 'text',
      label: '파일 크기',
      admin: {
        description: '예: 15.2 MB, 1.5 GB',
      },
    },
    {
      name: 'file_type',
      type: 'select',
      label: '파일 타입',
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'ZIP', value: 'zip' },
        { label: 'EXE', value: 'exe' },
        { label: 'MSI', value: 'msi' },
        { label: 'DOC', value: 'doc' },
        { label: 'XLS', value: 'xls' },
      ],
    },
    {
      name: 'version',
      type: 'text',
      label: '버전',
      admin: {
        description: '소프트웨어나 드라이버의 버전 정보',
      },
    },
    {
      name: 'member_only',
      type: 'checkbox',
      label: '회원 전용',
      defaultValue: false,
      admin: {
        description: '체크하면 로그인한 회원만 다운로드 가능',
      },
    },
    {
      name: 'download_count',
      type: 'number',
      label: '다운로드 횟수',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'related_products',
      type: 'array',
      label: '관련 제품',
      fields: [
        {
          name: 'product_name',
          type: 'text',
          label: '제품명',
        },
        {
          name: 'part_number',
          type: 'text',
          label: 'Part Number',
        },
      ],
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: '추천 다운로드',
      defaultValue: false,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: '공개 여부',
      defaultValue: true,
    },
  ],
  timestamps: true,
}

export default Downloads