'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function USBCardProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_usb_card" 
      categoryName="USB Card"
    />
  );
}
