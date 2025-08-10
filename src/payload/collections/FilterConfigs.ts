import type { CollectionConfig } from 'payload'

const FilterConfigs: CollectionConfig = {
  slug: 'filter-configs',
  admin: {
    useAsTitle: 'filter_label',
    defaultColumns: ['filter_label', 'category', 'filter_type', 'is_active'],
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
      name: 'filter_name',
      type: 'text',
      label: '필터 이름 (영문)',
      required: true,
      admin: {
        description: '데이터베이스 컬럼명과 일치해야 합니다. (예: scan_width)',
      },
    },
    {
      name: 'filter_label',
      type: 'text',
      label: '필터 표시명',
      required: true,
      admin: {
        description: '사용자에게 표시될 필터명 (예: Scan Width)',
      },
    },
    {
      name: 'filter_type',
      type: 'select',
      label: '필터 타입',
      options: [
        {
          label: 'Checkbox',
          value: 'checkbox',
        },
        {
          label: 'Slider',
          value: 'slider',
        },
      ],
      required: true,
    },
    {
      name: 'filter_unit',
      type: 'text',
      label: '단위',
      admin: {
        description: '필터 값의 단위 (예: mm, MHz, dpi)',
      },
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '정렬 순서',
      defaultValue: 0,
    },
    {
      name: 'default_expanded',
      type: 'checkbox',
      label: '기본 확장 여부',
      defaultValue: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: '활성 상태',
      defaultValue: true,
    },
    // Checkbox 타입 필터의 옵션들
    {
      name: 'options',
      type: 'array',
      label: '필터 옵션 (Checkbox 타입)',
      admin: {
        condition: (data) => data.filter_type === 'checkbox',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '표시명',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          label: '값',
          required: true,
        },
      ],
    },
    // Slider 타입 필터의 설정
    {
      name: 'slider_config',
      type: 'group',
      label: 'Slider 설정',
      admin: {
        condition: (data) => data.filter_type === 'slider',
      },
      fields: [
        {
          name: 'min_value',
          type: 'number',
          label: '최솟값',
          required: true,
        },
        {
          name: 'max_value',
          type: 'number',
          label: '최댓값',
          required: true,
        },
        {
          name: 'step_value',
          type: 'number',
          label: '단계값',
          defaultValue: 1,
        },
      ],
    },
  ],
  timestamps: true,
}

export default FilterConfigs