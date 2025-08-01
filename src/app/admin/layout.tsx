'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

const pageConfig: Record<string, { title?: string; showExportButton?: boolean }> = {
  '/admin': { title: 'Dashboard' },
  '/admin/newsletter': { title: 'Newsletter Subscriptions', showExportButton: true },
  '/admin/products': { title: 'Products' },
  '/admin/products/all': { title: 'All Products', showExportButton: true },
};

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const config = pageConfig[pathname] || {};

  return (
    <AdminLayout 
      title={config.title}
      showExportButton={config.showExportButton}
    >
      {children}
    </AdminLayout>
  );
}