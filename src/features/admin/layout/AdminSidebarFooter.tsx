import PulseLogo from '@/core/components/PulseLogo';

export function AdminSidebarFooter() {
  return (
    <div className="border-t border-sidebar-border bg-sidebar-background px-4 py-4 dark:border-slate-700">
      <div className="flex items-center justify-center gap-2 text-xs text-sidebar-foreground/70 dark:text-slate-400">
        <PulseLogo size={16} variant="night" />
        <div>
          <span>Pulse by </span>
          <span className="brand-gradient-text">TuWebAI</span>
        </div>
      </div>
    </div>
  );
}
