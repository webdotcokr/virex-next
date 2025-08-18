'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function LaserProfilerProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_3d_laser_profiler" 
      categoryName="3D Laser Profiler"
    />
  );
}
