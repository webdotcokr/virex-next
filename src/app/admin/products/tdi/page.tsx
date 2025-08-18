'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function TDIProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_tdi" 
      categoryName="TDI"
    />
  );
}