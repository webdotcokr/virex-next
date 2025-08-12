'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function CISProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_cis" 
      categoryName="CIS"
    />
  );
}