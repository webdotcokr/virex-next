import type { CollectionConfig } from 'payload'

const Makers: CollectionConfig = {
  slug: 'makers',
  admin: {
    useAsTitle: 'maker_name',
    defaultColumns: ['maker_name', 'maker_name_en', 'country', 'is_active'],
    group: '제품 관리',
  },
  fields: [
    {
      name: 'maker_name',
      type: 'text',
      label: '제조사명 (한국어)',
      required: true,
    },
    {
      name: 'maker_name_en',
      type: 'text',
      label: '제조사명 (영어)',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
      label: '국가',
      defaultValue: 'Korea',
    },
    {
      name: 'website_url',
      type: 'text',
      label: '웹사이트 URL',
      admin: {
        description: '제조사 공식 웹사이트 URL을 입력하세요.',
      },
    },
    {
      name: 'logo_url',
      type: 'text',
      label: '로고 이미지 URL',
      admin: {
        description: '제조사 로고 이미지 URL을 입력하세요.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '제조사 설명',
    },
    {
      name: 'contact_info',
      type: 'group',
      label: '연락처 정보',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: '이메일',
        },
        {
          name: 'phone',
          type: 'text',
          label: '전화번호',
        },
        {
          name: 'address',
          type: 'textarea',
          label: '주소',
        },
      ],
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: '활성 상태',
      defaultValue: true,
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '정렬 순서',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}

export default Makers