'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function InvisibleProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_invisible" 
      categoryName="Invisible"
    />
  );
}
EOF < /dev/null