'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function AFModuleProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_af_module" 
      categoryName="AF Module"
    />
  );
}
