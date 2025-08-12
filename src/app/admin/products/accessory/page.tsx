'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function AccessoryProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_accessory" 
      categoryName="Accessory"
    />
  );
}
