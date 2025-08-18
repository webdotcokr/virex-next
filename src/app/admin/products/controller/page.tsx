'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function ControllerProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_controller" 
      categoryName="Controller"
    />
  );
}
