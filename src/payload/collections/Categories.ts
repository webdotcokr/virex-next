import type { CollectionConfig } from 'payload'

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'category_name_kr',
    defaultColumns: ['category_name_kr', 'category_name_en', 'parent', 'is_visible'],
    group: '제품 관리',
  },
  fields: [
    {
      name: 'category_name_kr',
      type: 'text',
      label: '카테고리명 (한국어)',
      required: true,
    },
    {
      name: 'category_name_en',
      type: 'text',  
      label: '카테고리명 (영어)',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: '상위 카테고리',
      admin: {
        description: '상위 카테고리를 선택하세요. 최상위 카테고리인 경우 비워두세요.',
      },
    },
    {
      name: 'category_desc',
      type: 'textarea',
      label: '카테고리 설명',
    },
    {
      name: 'image_url',
      type: 'text',
      label: '카테고리 이미지 URL',
      admin: {
        description: '카테고리를 대표하는 이미지 URL을 입력하세요.',
      },
    },
    {
      name: 'is_visible',
      type: 'checkbox',
      label: '표시 여부',
      defaultValue: true,
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '정렬 순서',
      defaultValue: 0,
      admin: {
        description: '낮은 숫자가 먼저 표시됩니다.',
      },
    },
    {
      name: 'table_name',
      type: 'text',
      label: '제품 테이블명',
      admin: {
        description: '이 카테고리의 제품이 저장되는 테이블명 (예: products_cis)',
        placeholder: 'products_cis',
      },
    },
  ],
  timestamps: true,
}

export default Categories