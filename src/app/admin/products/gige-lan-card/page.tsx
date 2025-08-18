'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function GigELANCardProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_gige_lan_card" 
      categoryName="GigE LAN Card"
    />
  );
}
