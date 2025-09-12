
'use client';
import { usePathname } from 'next/navigation';
import DashboardLayout from './dashboard-layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If we are on the auth page, just render the children (the auth page itself)
  // without the dashboard layout.
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // For all other pages under /admin, wrap them in the DashboardLayout
  // which contains the auth protection and sidebar/header.
  return <DashboardLayout>{children}</DashboardLayout>;
}
