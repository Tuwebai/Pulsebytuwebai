export function AdminPageLoader() {
  return (
    <div className="h-screen bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground text-lg">Cargando panel de administración...</p>
      </div>
    </div>
  );
}
