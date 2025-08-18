import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ProductService } from '@/domains/product/services/product-service'
import ProductDetailView from '@/domains/product/components/ProductDetailView'
import type { Product } from '@/domains/product/types'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    // Decode URL-encoded slug (handles spaces and special characters)
    const decodedSlug = decodeURIComponent(slug)
    console.log('🔍 Product lookup:', { originalSlug: slug, decodedSlug })
    
    // Use getProductByPartNumber for full data with series and related products
    const product = await ProductService.getProductByPartNumber(decodedSlug)
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  
  if (!product) {
    return {
      title: '제품을 찾을 수 없습니다 - Virex',
      description: '요청하신 제품 정보를 찾을 수 없습니다.'
    }
  }

  const canonicalUrl = `https://virex.co.kr/products/${product.part_number}`
  const seriesName = product.series_data?.series_name || product.series || ''
  const shortText = product.series_data?.short_text || product.description || ''
  const makerName = product.maker_name || ''
  const categoryName = product.category_name || product.category?.name || ''

  return {
    title: `${product.part_number} - ${seriesName} | ${makerName}`,
    description: `${product.part_number} specifications and details. ${categoryName} by ${makerName}`,
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
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 800,
          height: 600,
          alt: product.part_number,
        }
      ] : undefined,
    },
    other: {
      // Structured Data (JSON-LD)
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.part_number,
        'brand': {
          '@type': 'Brand',
          'name': makerName
        },
        'category': categoryName,
        'productID': product.part_number,
        'url': canonicalUrl,
        'image': product.image_url,
        'description': shortText
      })
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

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
            'brand': {
              '@type': 'Brand',
              'name': product.maker_name || 'Unknown'
            },
            'category': product.category_name || product.category?.name || '',
            'productID': product.part_number,
            'url': `https://virex.co.kr/products/${product.part_number}`,
            'image': product.image_url,
            'description': product.series_data?.short_text || product.description || ''
          })
        }}
      />
      <ProductDetailView product={product} />
    </>
  )
}