'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function SoftwareProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_software" 
      categoryName="Software"
    />
  );
}
