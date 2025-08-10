import type { CollectionConfig } from 'payload'

const TableColumnConfigs: CollectionConfig = {
  slug: 'table-column-configs',
  admin: {
    useAsTitle: 'column_label',
    defaultColumns: ['column_label', 'category', 'column_type', 'is_visible'],
    group: '설정 관리',
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: '카테고리',
      required: true,
    },
    {
      name: 'column_name',
      type: 'text',
      label: '컬럼 이름 (영문)',
      required: true,
      admin: {
        description: '데이터베이스 컬럼명 (예: part_number, scan_width)',
      },
    },
    {
      name: 'column_label',
      type: 'text',
      label: '컬럼 표시명',
      required: true,
      admin: {
        description: '테이블 헤더에 표시될 컬럼명 (예: Part Number)',
      },
    },
    {
      name: 'column_type',
      type: 'select',
      label: '컬럼 타입',
      options: [
        {
          label: 'Basic (기본 정보)',
          value: 'basic',
        },
        {
          label: 'Specification (제품 사양)',
          value: 'specification',
        },
      ],
      required: true,
      admin: {
        description: 'Basic: 제품 기본 정보, Specification: specifications 필드 내 값',
      },
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
      name: 'column_width',
      type: 'text',
      label: '컬럼 너비',
      admin: {
        description: 'CSS 너비 값 (예: 120px, 10%, auto)',
        placeholder: 'auto',
      },
    },
    {
      name: 'is_sortable',
      type: 'checkbox',
      label: '정렬 가능 여부',
      defaultValue: true,
    },
    {
      name: 'is_visible',
      type: 'checkbox',
      label: '표시 여부',
      defaultValue: true,
    },
    {
      name: 'data_type',
      type: 'select',
      label: '데이터 타입',
      options: [
        {
          label: 'Text',
          value: 'text',
        },
        {
          label: 'Number',
          value: 'number',
        },
        {
          label: 'Boolean',
          value: 'boolean',
        },
        {
          label: 'Image URL',
          value: 'image',
        },
      ],
      defaultValue: 'text',
    },
    {
      name: 'format_options',
      type: 'group',
      label: '포맷 옵션',
      fields: [
        {
          name: 'unit',
          type: 'text',
          label: '단위',
          admin: {
            description: '숫자 값에 표시될 단위 (예: mm, MHz)',
          },
        },
        {
          name: 'decimal_places',
          type: 'number',
          label: '소수점 자릿수',
          admin: {
            description: '숫자 값의 소수점 자릿수',
          },
        },
        {
          name: 'prefix',
          type: 'text',
          label: '접두사',
        },
        {
          name: 'suffix',
          type: 'text',
          label: '접미사',
        },
      ],
    },
  ],
  timestamps: true,
}

export default TableColumnConfigs