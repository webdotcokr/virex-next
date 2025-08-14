'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function LargeFormatLensProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_large_format_lens" 
      categoryName="Large Format Lens"
    />
  );
}
