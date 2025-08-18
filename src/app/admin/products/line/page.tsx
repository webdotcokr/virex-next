'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function LineProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_line" 
      categoryName="Line"
    />
  );
}