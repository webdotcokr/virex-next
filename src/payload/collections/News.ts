import type { CollectionConfig } from 'payload'

const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'news_type', 'created_at', 'is_active'],
    group: '콘텐츠 관리',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '제목',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: '내용',
      required: true,
    },
    {
      name: 'news_type',
      type: 'select',
      label: '뉴스 타입',
      options: [
        {
          label: '공지사항',
          value: 'notice',
        },
        {
          label: '미디어',
          value: 'media',
        },
      ],
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: '요약',
      admin: {
        description: '목록 페이지에 표시될 간단한 요약',
      },
    },
    {
      name: 'featured_image',
      type: 'text',
      label: '대표 이미지 URL',
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: '메인 노출',
      defaultValue: false,
      admin: {
        description: '메인 페이지에 featured 뉴스로 표시할지 여부',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: '공개 여부',
      defaultValue: true,
    },
    {
      name: 'view_count',
      type: 'number',
      label: '조회수',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: '태그',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'meta_title',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'meta_description',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Keywords',
        },
      ],
    },
  ],
  timestamps: true,
}

export default News