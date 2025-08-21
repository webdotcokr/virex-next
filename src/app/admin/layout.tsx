'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminRoute from '@/components/AdminRoute';

const pageConfig: Record<string, { title?: string; showExportButton?: boolean }> = {
  '/admin': { title: 'Dashboard' },
  '/admin/newsletter': { title: 'Newsletter Subscriptions', showExportButton: true },
  '/admin/products': { title: 'Products' },
  '/admin/product-files': { title: 'Product Files Management' },
};

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const config = pageConfig[pathname] || {};

  return (
    <AdminRoute>
      <AdminLayout 
        title={config.title}
        showExportButton={config.showExportButton}
      >
        {children}
      </AdminLayout>
    </AdminRoute>
  );
}