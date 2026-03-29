import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface KeyboardShortcutsConfig {
  onToggleDragMode?: () => void;
  onClearFilters?: () => void;
  onExportData?: () => void;
  onCreateProject?: () => void;
  onRefreshData?: () => void;
  onToggleBulkMode?: () => void;
  onSelectAll?: () => void;
  onSearchFocus?: () => void;
  isDragMode?: boolean;
  isBulkMode?: boolean;
  hasProjects?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const navigate = useNavigate();
  const {
    onToggleDragMode,
    onClearFilters,
    onExportData,
    onCreateProject,
    onRefreshData,
    onToggleBulkMode,
    onSelectAll,
    onSearchFocus,
    isDragMode = false,
    isBulkMode = false,
    hasProjects = false
  } = config;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar si estamos en un input, textarea o contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;

    // Shortcuts principales
    switch (key.toLowerCase()) {
      case 'd':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (onToggleDragMode) {
            onToggleDragMode();
            toast({
              title: isDragMode ? 'Modo normal activado' : 'Modo arrastrar activado',
              description: isDragMode 
                ? 'Puedes hacer clic en los proyectos normalmente' 
                : 'Arrastra los proyectos para reordenarlos por prioridad',
            });
          }
        }
        break;

      case 'f':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (onSearchFocus) {
            onSearchFocus();
            toast({
              title: 'Búsqueda activada',
              description: 'Escribe para buscar en tus proyectos',
            });
          }
        }
        break;

      case 'r':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (onRefreshData) {
            onRefreshData();
            toast({
              title: 'Datos actualizados',
              description: 'Refrescando información del dashboard...',
            });
          }
        }
        break;

      case 'e':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (onExportData) {
            onExportData();
            toast({
              title: 'Exportando datos',
              description: 'Descargando información del dashboard...',
            });
          }
        }
        break;

      case 'b':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (onToggleBulkMode) {
            onToggleBulkMode();
            toast({
              title: isBulkMode ? 'Modo selección desactivado' : 'Modo selección activado',
              description: isBulkMode 
                ? 'Selección múltiple desactivada' 
                : 'Selecciona múltiples proyectos para acciones en lote',
            });
          }
        }
        break;

      case 'a':
        if (isCtrlOrCmd && !altKey && !shiftKey && isBulkMode) {
          event.preventDefault();
          if (onSelectAll) {
            onSelectAll();
            toast({
              title: 'Selección múltiple',
              description: 'Todos los proyectos han sido seleccionados',
            });
          }
        }
        break;

      case 'escape':
        if (!isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (isDragMode && onToggleDragMode) {
            onToggleDragMode();
            toast({
              title: 'Modo normal activado',
              description: 'Presiona ESC para salir del modo arrastrar',
            });
          } else if (isBulkMode && onToggleBulkMode) {
            onToggleBulkMode();
            toast({
              title: 'Modo selección desactivado',
              description: 'Presiona ESC para salir del modo selección',
            });
          }
        }
        break;

      case 'c':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          if (onClearFilters) {
            onClearFilters();
            toast({
              title: 'Filtros limpiados',
              description: 'Todos los filtros han sido restablecidos',
            });
          }
        }
        break;

      // Navegación rápida
      case '1':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          navigate('/dashboard');
          toast({
            title: 'Dashboard',
            description: 'Navegando al dashboard principal',
          });
        }
        break;

      case '2':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          navigate('/proyectos');
          toast({
            title: 'Proyectos',
            description: 'Navegando a la vista de proyectos',
          });
        }
        break;

      case '3':
        if (isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          navigate('/analytics');
          toast({
            title: 'Analíticas',
            description: 'Navegando a las analíticas',
          });
        }
        break;

      // Ayuda
      case '?':
        if (!isCtrlOrCmd && !altKey && !shiftKey) {
          event.preventDefault();
          toast({
            title: 'Atajos de teclado disponibles',
            description: 'Ctrl+D: Arrastrar | Ctrl+F: Buscar | Ctrl+R: Actualizar | Ctrl+E: Exportar | Ctrl+B: Selección múltiple | ESC: Salir del modo actual',
            duration: 8000,
          });
        }
        break;
    }
  }, [
    onToggleDragMode,
    onClearFilters,
    onExportData,
    onCreateProject,
    onRefreshData,
    onToggleBulkMode,
    onSelectAll,
    onSearchFocus,
    isDragMode,
    isBulkMode,
    navigate
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Función para mostrar ayuda de shortcuts
  const showShortcutsHelp = useCallback(() => {
    const shortcutsText = [
      '🎯 Atajos de teclado disponibles:',
      '• Ctrl+D: Activar/desactivar modo arrastrar',
      '• Ctrl+F: Enfocar búsqueda',
      '• Ctrl+R: Actualizar datos',
      '• Ctrl+E: Exportar datos',
      '• Ctrl+B: Modo selección múltiple',
      '• Ctrl+A: Seleccionar todo (en modo bulk)',
      '• Ctrl+C: Limpiar filtros',
      '• Ctrl+1/2/3: Navegación rápida',
      '• ESC: Salir del modo actual',
      '• ?: Mostrar esta ayuda'
    ].join('\n');

    toast({
      title: 'Atajos de teclado disponibles',
      description: shortcutsText,
      duration: 10000,
    });
  }, []);

  return {
    showShortcutsHelp
  };
};
