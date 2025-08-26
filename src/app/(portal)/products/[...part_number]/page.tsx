import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ProductService } from '@/domains/product/services/product-service'
import ProductDetailView from '@/domains/product/components/ProductDetailView'
import type { Product } from '@/domains/product/types'

interface ProductPageProps {
  params: Promise<{
    part_number: string[]
  }>
}

async function getProduct(partNumberSegments: string[]): Promise<Product | null> {
  try {
    // Reconstruct the part number from URL segments
    const partNumber = partNumberSegments.map(segment => decodeURIComponent(segment)).join('/')
    
    // Use getProductByPartNumber for full data with series and related products
    const product = await ProductService.getProductByPartNumber(partNumber)
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { part_number } = await params
  const product = await getProduct(part_number)
  
  if (!product) {
    return {
      title: '제품을 찾을 수 없습니다 - Virex',
      description: '요청하신 제품 정보를 찾을 수 없습니다.'
    }
  }

  const canonicalUrl = `https://virex.co.kr/products/${encodeURIComponent(product.part_number)}`
  const seriesName = product.series_data?.series_name || product.series || ''
  const shortText = product.series_data?.short_text || product.description || ''
  const makerName = product.maker_name || ''
  const categoryName = product.category_name || product.category?.name || ''

  return {
    title: `${product.part_number}${seriesName ? ` - ${seriesName}` : ''}${makerName ? ` | ${makerName}` : ''}`,
    description: `${product.part_number} specifications and details${categoryName ? `. ${categoryName}` : ''}${makerName ? ` by ${makerName}` : ''}`,
    keywords: [
      product.part_number,
      seriesName,
      categoryName,
      makerName,
      'Virex',
      'Industrial Camera',
      'Machine Vision'
    ].filter(Boolean).join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.part_number} - ${seriesName}`,
      description: shortText || `${categoryName} specifications and details`,
      url: canonicalUrl,
      type: 'website',
    },
    other: {
      // Structured Data (JSON-LD)
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.part_number,
        ...(makerName && {
          'brand': {
            '@type': 'Brand',
            'name': makerName
          }
        }),
        ...(categoryName && { 'category': categoryName }),
        'productID': product.part_number,
        'url': canonicalUrl,
        ...(product.image_url && { 'image': product.image_url }),
        ...(shortText && { 'description': shortText })
      })
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { part_number } = await params
  const product = await getProduct(part_number)

  if (!product) {
    notFound()
  }

  return (
    <>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': product.part_number,
            ...(product.maker_name && {
              'brand': {
                '@type': 'Brand',
                'name': product.maker_name
              }
            }),
            'category': product.category_name || product.category?.name || '',
            'productID': product.part_number,
            'url': `https://virex.co.kr/products/${encodeURIComponent(product.part_number)}`,
            'image': product.image_url,
            'description': product.series_data?.short_text || product.description || ''
          })
        }}
      />
      <ProductDetailView product={product} />
    </>
  )
}