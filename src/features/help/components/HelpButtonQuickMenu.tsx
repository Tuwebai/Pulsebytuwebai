import { BookOpen, HelpCircle, MessageCircle, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { motion } from '@/core/components/OptimizedMotion';
import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';

interface HelpButtonQuickMenuProps {
  completedFlows: string[];
  isMobile: boolean;
  onOpen: () => void;
  onStartTutorial: (flowId: string) => void;
  onToggleMenu: (open: boolean) => void;
}

export function HelpButtonQuickMenu({
  completedFlows,
  isMobile,
  onOpen,
  onStartTutorial,
  onToggleMenu,
}: HelpButtonQuickMenuProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'welcome-tour',
      label: 'Recorrido inicial',
      description: 'Ubicate rápido en Pulse',
      icon: Target,
      available: !completedFlows.includes('welcome-tour'),
      action: () => onStartTutorial('welcome-tour'),
    },
    {
      id: 'pulse-metrics-tour',
      label: 'Entender Pulse',
      description: 'Aprendé a leer tus métricas',
      icon: BookOpen,
      available: !completedFlows.includes('pulse-metrics-tour'),
      action: () => onStartTutorial('pulse-metrics-tour'),
    },
    {
      id: 'help-center',
      label: 'Ayuda Pulse',
      description: 'Buscá respuestas rápidas',
      icon: HelpCircle,
      available: true,
      action: onOpen,
    },
    {
      id: 'contact-support',
      label: 'Contactar Soporte',
      description: 'Abrí una consulta con el equipo',
      icon: MessageCircle,
      available: true,
      action: () => navigate('/dashboard/soporte'),
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={cn(
        'absolute rounded-2xl border-2 border-slate-300 bg-white shadow-2xl',
        'ring-2 ring-blue-100 ring-opacity-50',
        'bg-white/95 backdrop-blur-sm',
        isMobile ? 'bottom-14 right-0 w-[90vw] max-w-[320px] p-3' : 'bottom-16 right-0 w-80 p-4',
      )}
    >
      <div className={cn(isMobile ? 'space-y-2' : 'space-y-3')}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white',
                isMobile ? 'h-7 w-7' : 'h-8 w-8',
              )}
            >
              <HelpCircle className={cn(isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
            </div>
            <div>
              <h3 className={cn('font-semibold text-slate-800', isMobile ? 'text-sm' : 'text-base')}>
                Ayuda Pulse
              </h3>
              <p className="text-xs text-slate-500">Acceso rápido a la ayuda</p>
            </div>
          </div>

          {isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleMenu(false)}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>

        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            onClick={() => {
              action.action();
              onToggleMenu(false);
            }}
            disabled={!action.available}
            className={cn('w-full justify-start hover:bg-slate-50', isMobile ? 'h-auto p-2' : 'h-auto p-3')}
          >
            <div className={cn('flex items-center', isMobile ? 'gap-2' : 'gap-3')}>
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg',
                  isMobile ? 'h-7 w-7' : 'h-8 w-8',
                  action.available ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400',
                )}
              >
                <action.icon className={cn(isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className={cn('truncate font-medium text-slate-800', isMobile ? 'text-sm' : 'text-base')}>
                  {action.label}
                </div>
                <div className="text-xs text-slate-500">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}

        <div className="border-t border-slate-200 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpen();
              onToggleMenu(false);
            }}
            className={cn('w-full', isMobile ? 'h-9 text-sm' : 'h-10')}
          >
            <BookOpen className={cn('mr-2', isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
            Ver todo
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
