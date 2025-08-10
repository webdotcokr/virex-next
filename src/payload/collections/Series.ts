import type { CollectionConfig } from 'payload'

const Series: CollectionConfig = {
  slug: 'series',
  admin: {
    useAsTitle: 'series_name',
    defaultColumns: ['series_name', 'maker', 'is_active'],
    group: '제품 관리',
  },
  fields: [
    {
      name: 'series_name',
      type: 'text',
      label: '시리즈명',
      required: true,
    },
    {
      name: 'maker',
      type: 'relationship',
      relationTo: 'makers',
      label: '제조사',
      required: true,
    },
    {
      name: 'intro_text',
      type: 'textarea',
      label: '소개글',
      admin: {
        description: '시리즈 소개 텍스트를 입력하세요.',
      },
    },
    {
      name: 'short_text',
      type: 'textarea',
      label: '간단 설명',
      admin: {
        description: '시리즈 간단 설명을 입력하세요.',
      },
    },
    {
      name: 'youtube_url',
      type: 'text',
      label: 'YouTube URL',
      admin: {
        description: '시리즈 소개 YouTube 영상 URL을 입력하세요.',
      },
    },
    {
      name: 'feature_image_url',
      type: 'text',
      label: '대표 이미지 URL',
    },
    // Features (최대 4개)
    {
      name: 'features',
      type: 'array',
      label: '주요 특징',
      maxRows: 4,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '특징 제목',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: '특징 설명',
          required: true,
        },
      ],
    },
    // Strengths (최대 6개)
    {
      name: 'strengths',
      type: 'array',
      label: '강점',
      maxRows: 6,
      fields: [
        {
          name: 'strength',
          type: 'text',
          label: '강점',
          required: true,
        },
      ],
    },
    // Applications (최대 4개)
    {
      name: 'applications',
      type: 'array',
      label: '어플리케이션',
      maxRows: 4,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '어플리케이션 제목',
          required: true,
        },
        {
          name: 'image_url',
          type: 'text',
          label: '이미지 URL',
        },
      ],
    },
    // Text Content Items (최대 5개)
    {
      name: 'text_items',
      type: 'array',
      label: '텍스트 콘텐츠',
      maxRows: 5,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '제목',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: '설명',
          required: true,
        },
        {
          name: 'image_url',
          type: 'text',
          label: '이미지 URL',
        },
      ],
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: '활성 상태',
      defaultValue: true,
    },
  ],
  timestamps: true,
}

export default Series