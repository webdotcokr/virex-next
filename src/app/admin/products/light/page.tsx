'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function LightProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_light" 
      categoryName="Light"
    />
  );
}
