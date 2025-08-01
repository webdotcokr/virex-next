import { supabase } from '@/lib/supabase'
import type { Category } from '../types'

export interface CategoryInfo {
  id: string
  name: string
  enName: string
  description: string
  backgroundImage: string
}

export class CategoryService {
  // 카테고리별 Hero Section 정보 매핑 (향후 DB로 이전 가능)
  private static categoryInfoMap: Record<string, CategoryInfo> = {
    '4': { // AF Module
      id: '4',
      name: '오토포커스모듈',
      enName: 'AF Module', 
      description: 'FPGA 기반의 실시간 위치 측정 및 Z축 제어 자동 초점 모듈',
      backgroundImage: '/img/backgrounds/camera-cis-bg.webp'
    },
    '7': { // Software
      id: '7',
      name: '소프트웨어',
      enName: 'Software', 
      description: 'Sapera processing / (Barcode,OCR등) / 및 AI 개발자키트 Astrocyte',
      backgroundImage: '/img/backgrounds/camera-cis-bg.webp'
    },
    '9': { // CIS
      id: '9',
      name: '카메라',
      enName: 'CIS Camera', 
      description: '센서,렌즈,조명 일체형 / 300~3600DPI / Contact Image Sensor',
      backgroundImage: '/img/backgrounds/camera-cis-bg.webp'
    },
    '10': { // TDI
      id: '10',
      name: '카메라',
      enName: 'TDI Camera',
      description: '최대 32K해상도 지원 / 16K 해상도 1MHz Line rate / 초고속 고감도 TDI 카메라',
      backgroundImage: '/img/backgrounds/camera-tdi-bg.webp'
    },
    '11': { // Line
      id: '11',
      name: '카메라',
      enName: 'Line Camera',
      description: '8K, 16K 해상도에서 최대 300KHz / HDR 및 다중 스펙트럼 / Multi Line Scan 카메라',
      backgroundImage: '/img/backgrounds/camera-line-bg.webp'
    },
    '12': { // Area
      id: '12',
      name: '카메라',
      enName: 'Area Camera',
      description: '0.3MP 컴팩트 사이즈 카메라부터 / 152MP 초고해상도 / Area Scan 카메라',
      backgroundImage: '/img/backgrounds/camera-area-bg.webp'
    },
    '13': { // Invisible
      id: '13',
      name: '카메라',
      enName: 'Invisible Camera',
      description: 'Pixel Operability 99% / 고감도 2K / SWIR Line Scan Camera',
      backgroundImage: '/img/backgrounds/camera-invisible-bg.webp'
    },
    '14': { // Scientific
      id: '14',
      name: '카메라',
      enName: 'Scientific Camera',
      description: '96%의 QE / 서브전자 0.7e- 노이즈 / back-illuminated sCMOS Camera',
      backgroundImage: '/img/backgrounds/camera-scientific-bg.webp'
    },
    '15': { // Large Format
      id: '15',
      name: '렌즈',
      enName: 'Large Format Lens',
      description: '0.04x~6.2x 배율 / Apochromatic 보정 / Image Circle 82mm 이상 라인스캔 렌즈',
      backgroundImage: '/img/backgrounds/lens-large-bg.webp'
    },
    '16': { // Telecentric
      id: '16',
      name: '렌즈',
      enName: 'Telecentric Lens',
      description: '2/3" ~ Dia 44mm Image Circle / 0.12x ~ 6.0x 배율 / Telecentric Lens',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '17': { // FA Lens
      id: '17',
      name: '렌즈',
      enName: 'FA Lens',
      description: '1/1.7" ~ 1.1" 24MP / (2.74um 픽셀사이즈 지원) 대응 / Fixed Focal Length 렌즈',
      backgroundImage: '/img/backgrounds/lens-fa-bg.webp'
    },
    '18': { // 3D Laser Profiler
      id: '18',
      name: '3D 카메라',
      enName: '3D Laser Profiler',
      description: '레이저 광삼각법 방식으로 / 정밀한 높이 측정 / 3D 레이저 프로파일러',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '19': { // 3D Stereo Camera
      id: '19',
      name: '3D 카메라',
      enName: '3D Stereo Camera',
      description: 'Sony 3MP 센서 탑재로 / 높은 깊이 정확도 / 5GigE 3D 스테레오 카메라',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '20': { // Light
      id: '20',
      name: '조명',
      enName: 'Light',
      description: '고속 이미징 처리에 적합한 / 고휘도 하이브리드 스팟 조명',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '21': { // Light sources
      id: '21',
      name: '조명',
      enName: 'Light sources',
      description: '최대 2CH 제어 / 150W 라이트소스',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '22': { // Controller
      id: '22',
      name: '조명',
      enName: 'Controller',
      description: '최대 200A에서 0.5us 이하 / 초고속 펄스 생성 / 스트로브 컨트롤러',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '23': { // Frame Grabber
      id: '23',
      name: '프레임그래버',
      enName: 'Frame Grabber',
      description: '실시간 패킷해제 엔진으로 / CPU부하량을 최소화 하는 Xtium2 / 프레임그래버 시리즈',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '24': { // GigE Lan Card
      id: '24',
      name: '프레임그래버',
      enName: 'GigE Lan Card',
      description: '머신비전 산업용 NIC 보드 / (1G, 2.5G, 5G, 10G 지원)',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '25': { // USB Card
      id: '25',
      name: '프레임그래버',
      enName: 'USB Card',
      description: '머신비전 산업용 USB 카드 / (USB Interface)',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '26': { // Cable
      id: '26',
      name: '주변기기',
      enName: 'Cable',
      description: 'AOC, Camera Link / USB3.0 / GigE 고성능 데이터 케이블',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '27': { // Accessory
      id: '27',
      name: '주변기기',
      enName: 'Accessory',
      description: 'Camera Link 및 / CoaxPress 리피터, Xtium2 / 프레임그래버용 외부 I/O 보드',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    },
    '28': { // ETC
      id: '28',
      name: '주변기기',
      enName: 'ETC',
      description: '',
      backgroundImage: '/img/backgrounds/lens-telecentric-bg.webp'
    }
  }

  /**
   * 모든 카테고리 조회
   */
  static async getAllCategories(): Promise<Category[]> {
    console.log('Fetching all categories from Supabase...')
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Categories fetch error:', error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    console.log('Categories fetched successfully:', data?.length || 0, 'categories')
    return data || []
  }

  /**
   * 형제 카테고리 조회 (같은 parent_id를 가진 카테고리들)
   */
  static async getSiblingCategories(categoryId: string | number): Promise<Category[]> {
    console.log('Fetching sibling categories for category:', categoryId)
    
    // 먼저 현재 카테고리의 parent_id를 조회
    const { data: currentCategory, error: currentError } = await supabase
      .from('categories')
      .select('parent_id')
      .eq('id', categoryId)
      .single()

    if (currentError) {
      console.error('Current category fetch error:', currentError)
      throw new Error(`Failed to fetch current category: ${currentError.message}`)
    }

    if (!currentCategory?.parent_id) {
      console.log('No parent category found, returning empty array')
      return []
    }

    // 같은 parent_id를 가진 모든 카테고리 조회
    const { data: siblings, error: siblingsError } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', currentCategory.parent_id)
      .order('name')

    if (siblingsError) {
      console.error('Sibling categories fetch error:', siblingsError)
      throw new Error(`Failed to fetch sibling categories: ${siblingsError.message}`)
    }

    console.log('Sibling categories fetched successfully:', siblings?.length || 0, 'categories')
    return siblings || []
  }

  /**
   * 특정 parent_id의 자식 카테고리들 조회
   */
  static async getChildCategories(parentId: string | number): Promise<Category[]> {
    console.log('Fetching child categories for parent:', parentId)
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name')

    if (error) {
      console.error('Child categories fetch error:', error)
      throw new Error(`Failed to fetch child categories: ${error.message}`)
    }

    console.log('Child categories fetched successfully:', data?.length || 0, 'categories')
    return data || []
  }

  /**
   * 카테고리 정보 조회 (Hero Section용)
   */
  static getCategoryInfo(categoryId: string | number): CategoryInfo {
    const id = String(categoryId)
    return this.categoryInfoMap[id] || {
      id,
      name: '제품',
      enName: 'Product',
      description: '고품질 산업용 제품',
      backgroundImage: '/img/backgrounds/default-bg.png'
    }
  }

  /**
   * 특정 카테고리 조회
   */
  static async getCategoryById(categoryId: string | number): Promise<Category | null> {
    console.log('Fetching category by ID:', categoryId)
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Category not found
      }
      console.error('Category fetch error:', error)
      throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return data
  }

  /**
   * 브레드크럼 생성
   */
  static async getBreadcrumbs(categoryId: string | number): Promise<Array<{label: string, href?: string, active?: boolean}>> {
    const category = await this.getCategoryById(categoryId)
    if (!category) {
      return [
        { label: 'Home', href: '/' },
        { label: '제품', href: '/products' }
      ]
    }

    const categoryInfo = this.getCategoryInfo(categoryId)
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: '제품', href: '/products' }
    ]

    // 부모 카테고리가 있는 경우 추가
    if (category.parent_id) {
      const parentCategory = await this.getCategoryById(category.parent_id)
      if (parentCategory) {
        const parentInfo = this.getCategoryInfo(category.parent_id)
        breadcrumbs.push({
          label: parentInfo.name,
          href: `/products?categories=${category.parent_id}`
        })
      }
    }

    // 현재 카테고리 추가
    breadcrumbs.push({
      label: categoryInfo.name,
      active: true
    })

    return breadcrumbs
  }

  /**
   * 루트 카테고리들 조회 (parent_id가 null인 카테고리들)
   */
  static async getRootCategories(): Promise<Category[]> {
    console.log('Fetching root categories...')
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name')

    if (error) {
      console.error('Root categories fetch error:', error)
      throw new Error(`Failed to fetch root categories: ${error.message}`)
    }

    console.log('Root categories fetched successfully:', data?.length || 0, 'categories')
    return data || []
  }
}