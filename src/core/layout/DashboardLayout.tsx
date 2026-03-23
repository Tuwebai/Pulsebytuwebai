import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[var(--bg-base)]">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
