import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/domains/product/services/product-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { part_number: string } }
) {
  try {
    const partNumber = decodeURIComponent(params.part_number)
    
    console.log('🔍 API: Fetching product:', partNumber)
    
    // Use the optimized RPC method
    const product = await ProductService.getProductByPartNumberOptimized(partNumber)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      )
    }

    console.log('✅ API: Product found:', product.part_number)

    // Return with aggressive caching headers
    return NextResponse.json(product, {
      headers: {
        // Cache for 1 hour, but allow stale content for 24 hours while revalidating
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
        // Optional: Add ETag for better cache validation
        'ETag': `"${product.part_number}-${product.updated_at}"`
      }
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Support HEAD requests for cache validation
export async function HEAD(
  request: NextRequest,
  { params }: { params: { part_number: string } }
) {
  try {
    const partNumber = decodeURIComponent(params.part_number)
    const product = await ProductService.getProductByPartNumberOptimized(partNumber)
    
    if (!product) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'ETag': `"${product.part_number}-${product.updated_at}"`
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}