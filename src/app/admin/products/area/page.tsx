'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function AreaProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_area" 
      categoryName="Area"
    />
  );
}