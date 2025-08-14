'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function TelecentricProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_telecentric" 
      categoryName="Telecentric"
    />
  );
}
