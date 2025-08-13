'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function ScientificProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_scientific" 
      categoryName="Scientific"
    />
  );
}