'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function StereoCameraProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_3d_stereo_camera" 
      categoryName="3D Stereo Camera"
    />
  );
}
