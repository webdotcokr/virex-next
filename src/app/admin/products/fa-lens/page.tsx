'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function FALensProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_fa_lens" 
      categoryName="FA Lens"
    />
  );
}
