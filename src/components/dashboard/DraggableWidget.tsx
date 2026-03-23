import React, { useState } from 'react';
import type { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { GripVertical, Settings, Eye, EyeOff } from 'lucide-react';

export interface Widget {
  id: string;
  type: string;
  title: string;
  content: React.ReactNode;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number };
  visible: boolean;
  configurable: boolean;
  role?: string[];
}

export interface DraggableWidgetProps {
  widget: Widget;
  onUpdate: (widget: Widget) => void;
  onConfigure: (widget: Widget) => void;
  userRole?: string;
  isDragging?: boolean;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  innerRef?: (element: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  onUpdate,
  onConfigure,
  userRole,
  isDragging = false,
  draggableProps,
  dragHandleProps,
  innerRef,
  style
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleVisibility = () => {
    onUpdate({ ...widget, visible: !widget.visible });
  };

  const handleConfigure = () => {
    onConfigure(widget);
  };

  const isAccessible = !widget.role || (userRole && widget.role.includes(userRole));

  if (!isAccessible) {
    return null;
  }

  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-2 row-span-1',
    lg: 'col-span-2 row-span-2',
    xl: 'col-span-3 row-span-2'
  };

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={cn(
        'relative group transition-all duration-200',
        sizeClasses[widget.size],
        isDragging && 'opacity-50',
        !widget.visible && 'opacity-30'
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          'h-full transition-all duration-200',
          isHovered && 'shadow-lg scale-105',
          !widget.visible && 'border-dashed'
        )}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div
              {...dragHandleProps}
              className="cursor-move text-muted-foreground hover:text-foreground transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">{widget.title}</h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleVisibility}
              className={cn(
                'p-1 rounded hover:bg-muted transition-colors',
                widget.visible ? 'text-foreground' : 'text-muted-foreground'
              )}
              title={widget.visible ? 'Ocultar widget' : 'Mostrar widget'}
            >
              {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            
            {widget.configurable && (
              <button
                onClick={handleConfigure}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Configurar widget"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-4">
          {widget.visible ? widget.content : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <EyeOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Widget oculto</p>
              </div>
            </div>
          )}
        </div>

        {/* Drag Indicator */}
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-primary font-medium">Soltar aquí</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export { DraggableWidget };
