'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function CableProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_cable" 
      categoryName="Cable"
    />
  );
}
