'use client';

import ProductCategoryDataGrid from '@/components/admin/ProductCategoryDataGrid';

export default function FrameGrabberProductsPage() {
  return (
    <ProductCategoryDataGrid 
      tableName="products_frame_grabber" 
      categoryName="Frame Grabber"
    />
  );
}
