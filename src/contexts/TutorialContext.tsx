import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // Selector CSS del elemento objetivo
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll' | 'wait' | 'navigate';
  actionText?: string;
  skipable?: boolean;
  required?: boolean;
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  nextStep?: string;
  prevStep?: string;
  // Navegación real
  navigateTo?: string; // Ruta a la que navegar
  waitForNavigation?: boolean; // Esperar a que se complete la navegación
  navigationDelay?: number; // Delay después de la navegación
  autoNavigate?: boolean; // Navegación automática cuando se muestra el paso
}

export interface TutorialFlow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'feature' | 'advanced' | 'troubleshooting';
  steps: TutorialStep[];
  estimatedTime: number; // en minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  completionReward?: string;
}

export interface TutorialProgress {
  flowId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  skippedSteps: string[];
  timeSpent: number; // en segundos
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  videoTutorial?: string;
  screenshots?: string[];
}

// =====================================================
// CONTEXTO
// =====================================================

interface TutorialContextType {
  // Estado del tutorial
  isActive: boolean;
  currentFlow: TutorialFlow | null;
  currentStep: TutorialStep | null;
  stepIndex: number;
  progress: TutorialProgress | null;
  
  // Flujos de tutorial
  availableFlows: TutorialFlow[];
  completedFlows: string[];
  
  // Artículos de ayuda
  helpArticles: HelpArticle[];
  searchQuery: string;
  filteredArticles: HelpArticle[];
  
  // Acciones
  startTutorial: (flowId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeTutorial: () => void;
  exitTutorial: () => void;
  navigateToStep: (stepId: string) => void;
  searchHelp: (query: string) => void;
  markArticleHelpful: (articleId: string, helpful: boolean) => void;
  getContextualHelp: (context: string) => HelpArticle[];
  
  // Configuración
  autoStart: boolean;
  showHints: boolean;
  enableSounds: boolean;
  setAutoStart: (enabled: boolean) => void;
  setShowHints: (enabled: boolean) => void;
  setEnableSounds: (enabled: boolean) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// =====================================================
// FLUJOS DE TUTORIAL PREDEFINIDOS
// =====================================================

const TUTORIAL_FLOWS: TutorialFlow[] = [
  {
    id: 'welcome-tour',
    name: 'Tour de Bienvenida',
    description: 'Conoce las funcionalidades principales del dashboard',
    icon: '🎯',
    category: 'onboarding',
    estimatedTime: 8,
    difficulty: 'beginner',
    completionReward: 'Bienvenido a Pulse by TuWebAI',
    steps: [
      {
        id: 'welcome-1',
        title: 'Bienvenido a Pulse by TuWebAI',
        description: 'Te guiaremos por las funcionalidades principales del dashboard para que puedas aprovechar al máximo la plataforma.',
        target: '.dashboard-header',
        position: 'bottom',
        action: 'wait',
        actionText: 'Continúa para comenzar',
        skipable: false,
        required: true
      },
      {
        id: 'welcome-2',
        title: 'Panel de Proyectos',
        description: 'Aquí puedes ver todos tus proyectos, crear nuevos, y gestionar los existentes. Cada proyecto tiene su propio estado y progreso.',
        target: '.projects-section',
        position: 'right',
        action: 'hover',
        actionText: 'Pasa el mouse sobre un proyecto',
        skipable: true,
        tips: [
          'Los proyectos se organizan por estado',
          'Puedes filtrar por tipo o fecha',
          'Usa la búsqueda para encontrar proyectos específicos'
        ]
      },
      {
        id: 'welcome-3',
        title: 'Explorar la Sección de Proyectos',
        description: 'Ahora vamos a navegar a la sección de proyectos para ver todas las funcionalidades disponibles.',
        target: '.main-navigation',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Navegar a la sección de proyectos',
        navigateTo: '/proyectos',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'La sección de proyectos es donde gestionas todo',
          'Puedes crear, editar y eliminar proyectos',
          'Cada proyecto tiene su propio espacio de trabajo'
        ]
      },
      {
        id: 'welcome-4',
        title: 'Gestión de Proyectos',
        description: 'En esta página puedes ver todos tus proyectos, crear nuevos y gestionar los existentes. Observa las diferentes opciones disponibles.',
        target: '.projects-grid',
        position: 'right',
        action: 'wait',
        actionText: 'Observa las opciones disponibles',
        skipable: true,
        tips: [
          'Usa el botón "Crear Proyecto" para nuevos proyectos',
          'Filtra por estado, tipo o fecha',
          'Cada proyecto muestra su progreso actual'
        ]
      },
      {
        id: 'welcome-5',
        title: 'Explorar tu Perfil',
        description: 'Ahora vamos a ver tu perfil personal donde puedes configurar tu información y preferencias.',
        target: '.user-profile',
        position: 'left',
        action: 'navigate',
        actionText: 'Navegar a tu perfil',
        navigateTo: '/perfil',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'Puedes cambiar tu avatar y información personal',
          'Configura tus preferencias de notificación',
          'Personaliza el tema y idioma de la aplicación'
        ]
      },
      {
        id: 'welcome-6',
        title: 'Configuración Personal',
        description: 'En tu perfil puedes personalizar tu experiencia, cambiar tu avatar, y configurar las notificaciones según tus preferencias.',
        target: '.profile-settings',
        position: 'right',
        action: 'wait',
        actionText: 'Explora las opciones de configuración',
        skipable: true,
        tips: [
          'Mantén tu información actualizada',
          'Configura las notificaciones que necesites',
          'Personaliza tu experiencia de usuario'
        ]
      },
      {
        id: 'welcome-7',
        title: 'Volver al Dashboard',
        description: 'Ahora regresemos al dashboard principal para completar el tour.',
        target: '.dashboard-link',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Volver al dashboard',
        navigateTo: '/dashboard',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true
      },
      {
        id: 'welcome-8',
        title: '¡Listo para comenzar!',
        description: 'Ya conoces lo básico del dashboard. Puedes acceder a más tutoriales desde el menú de ayuda en cualquier momento.',
        target: '.help-button',
        position: 'top',
        action: 'click',
        actionText: 'Accede a la ayuda',
        skipable: false,
        required: true,
        tips: [
          'El botón de ayuda está siempre disponible',
          'Puedes buscar artículos específicos',
          'Los tutoriales se adaptan a tu nivel de experiencia'
        ]
      }
    ]
  },
  {
    id: 'project-management',
    name: 'Gestión de Proyectos',
    description: 'Aprende a crear, gestionar y colaborar en proyectos',
    icon: '📁',
    category: 'feature',
    estimatedTime: 12,
    difficulty: 'intermediate',
    prerequisites: ['welcome-tour'],
    steps: [
      {
        id: 'project-1',
        title: 'Navegar a la Sección de Proyectos',
        description: 'Primero vamos a la sección de proyectos para comenzar con la gestión.',
        target: '.main-navigation',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Navegar a proyectos',
        navigateTo: '/proyectos',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true
      },
      {
        id: 'project-2',
        title: 'Explorar Tus Proyectos',
        description: 'Aprende a recorrer la vista de proyectos y ubicar la información operativa más importante.',
        target: '.projects-grid',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Ver tus proyectos',
        navigateTo: '/dashboard/proyecto',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'Selecciona el tipo de proyecto apropiado',
          'Añade una descripción detallada',
          'Configura las funcionalidades necesarias'
        ]
      },
      {
        id: 'project-3',
        title: 'Lectura de la Lista de Proyectos',
        description: 'En esta vista puedes revisar estado, progreso y contexto de cada proyecto disponible.',
        target: '.projects-grid',
        position: 'right',
        action: 'wait',
        actionText: 'Observa la lista de proyectos',
        skipable: true,
        tips: [
          'Completa todos los campos obligatorios',
          'Selecciona el tipo de proyecto correcto',
          'Añade una descripción clara y detallada'
        ]
      },
      {
        id: 'project-4',
        title: 'Volver a la Lista de Proyectos',
        description: 'Ahora regresemos a la lista de proyectos para ver cómo gestionarlos.',
        target: '.back-button',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Volver a proyectos',
        navigateTo: '/proyectos',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true
      },
      {
        id: 'project-5',
        title: 'Gestionar Proyectos Existentes',
        description: 'Aquí puedes ver todos tus proyectos y acceder a las opciones de gestión.',
        target: '.projects-grid',
        position: 'right',
        action: 'wait',
        actionText: 'Observa las opciones de gestión',
        skipable: true,
        tips: [
          'Haz clic en un proyecto para ver detalles',
          'Usa los botones de acción para gestionar',
          'Filtra y ordena según tus necesidades'
        ]
      },
      {
        id: 'project-6',
        title: 'Explorar Colaboración',
        description: 'Ahora vamos a ver cómo funciona la colaboración en tiempo real.',
        target: '.collaboration-link',
        position: 'left',
        action: 'navigate',
        actionText: 'Acceder a colaboración',
        navigateTo: '/proyectos/1/colaboracion',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'La colaboración permite trabajar en equipo',
          'Puedes chatear en tiempo real',
          'Comparte archivos y comentarios'
        ]
      },
      {
        id: 'project-7',
        title: 'Herramientas de Colaboración',
        description: 'En esta página puedes colaborar con tu equipo usando chat, comentarios y compartir archivos.',
        target: '.collaboration-tools',
        position: 'right',
        action: 'wait',
        actionText: 'Explora las herramientas',
        skipable: true,
        tips: [
          'El chat se actualiza en tiempo real',
          'Puedes compartir archivos y comentarios',
          'Las notificaciones te mantienen informado'
        ]
      }
    ]
  },
  {
    id: 'advanced-features',
    name: 'Funcionalidades Avanzadas',
    description: 'Descubre las características avanzadas del dashboard',
    icon: '⚡',
    category: 'advanced',
    estimatedTime: 12,
    difficulty: 'advanced',
    prerequisites: ['welcome-tour', 'project-management'],
    steps: [
      {
        id: 'advanced-1',
        title: 'Analytics Avanzados',
        description: 'Utiliza las herramientas de análisis para obtener insights detallados sobre tus proyectos.',
        target: '.analytics-section',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Explora los analytics',
        navigateTo: '/analytics',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'Los gráficos son interactivos',
          'Puedes exportar los datos',
          'Configura alertas personalizadas'
        ]
      },
      {
        id: 'advanced-2',
        title: 'Herramientas de Análisis',
        description: 'En esta página puedes ver análisis detallados de tus proyectos y rendimiento.',
        target: '.analytics-dashboard',
        position: 'right',
        action: 'wait',
        actionText: 'Explora las métricas',
        skipable: true,
        tips: [
          'Las métricas se actualizan en tiempo real',
          'Puedes filtrar por período',
          'Exporta reportes personalizados'
        ]
      }
    ]
  },
  {
    id: 'support-help',
    name: 'Centro de Ayuda y Soporte',
    description: 'Aprende a usar el sistema de ayuda y soporte',
    icon: '🆘',
    category: 'onboarding',
    estimatedTime: 6,
    difficulty: 'beginner',
    steps: [
      {
        id: 'support-1',
        title: 'Acceder al Centro de Ayuda',
        description: 'Vamos a explorar el centro de ayuda donde puedes encontrar tutoriales y soporte.',
        target: '.help-button',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Acceder al centro de ayuda',
        navigateTo: '/soporte',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'El centro de ayuda tiene todos los recursos',
          'Puedes buscar artículos específicos',
          'Hay tutoriales paso a paso'
        ]
      },
      {
        id: 'support-2',
        title: 'Explorar Artículos de Ayuda',
        description: 'En esta página puedes encontrar artículos organizados por categorías para resolver tus dudas.',
        target: '.help-articles',
        position: 'right',
        action: 'wait',
        actionText: 'Explora los artículos disponibles',
        skipable: true,
        tips: [
          'Los artículos están organizados por categorías',
          'Usa la búsqueda para encontrar temas específicos',
          'Puedes marcar artículos como útiles'
        ]
      },
      {
        id: 'support-3',
        title: 'Buscar Ayuda Específica',
        description: 'Aprende a usar la función de búsqueda para encontrar ayuda sobre temas específicos.',
        target: '.help-search',
        position: 'bottom',
        action: 'wait',
        actionText: 'Prueba la búsqueda',
        skipable: true,
        tips: [
          'Escribe palabras clave relacionadas',
          'Los resultados se filtran en tiempo real',
          'Puedes buscar por categoría o etiqueta'
        ]
      },
      {
        id: 'support-4',
        title: 'Contactar Soporte',
        description: 'Si no encuentras la respuesta, puedes contactar directamente con nuestro equipo de soporte.',
        target: '.contact-support',
        position: 'left',
        action: 'wait',
        actionText: 'Explora las opciones de contacto',
        skipable: true,
        tips: [
          'Puedes enviar un ticket de soporte',
          'Hay chat en vivo disponible',
          'El equipo responde rápidamente'
        ]
      }
    ]
  },
  {
    id: 'projects-page-tour',
    name: 'Tour de la Página de Proyectos',
    description: 'Aprende a usar todas las funcionalidades de la página de proyectos',
    icon: '📋',
    category: 'feature',
    estimatedTime: 10,
    difficulty: 'beginner',
    steps: [
      {
        id: 'projects-page-1',
        title: 'Vista General de Proyectos',
        description: 'En esta página puedes ver todos tus proyectos organizados de manera clara y accesible.',
        target: '.projects-header',
        position: 'bottom',
        action: 'wait',
        actionText: 'Observa la estructura de la página',
        skipable: true,
        tips: [
          'Los proyectos se muestran en tarjetas organizadas',
          'Puedes ver el estado y progreso de cada uno',
          'Usa los filtros para encontrar proyectos específicos'
        ]
      },
      {
        id: 'projects-page-2',
        title: 'Explorar la Lista de Proyectos',
        description: 'Aprende a recorrer esta página para entender el estado y el contexto de cada proyecto.',
        target: '.projects-grid',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Ver la lista de proyectos',
        navigateTo: '/dashboard/proyecto',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true,
        tips: [
          'Haz clic en el botón "Crear Proyecto"',
          'Completa todos los campos obligatorios',
          'Selecciona el tipo de proyecto apropiado'
        ]
      },
      {
        id: 'projects-page-3',
        title: 'Lectura de Proyectos',
        description: 'Desde aquí puedes entender mejor cada proyecto, su contexto y su estado actual.',
        target: '.projects-grid',
        position: 'right',
        action: 'wait',
        actionText: 'Explora la información disponible',
        skipable: true,
        tips: [
          'Añade un título descriptivo',
          'Selecciona el tipo de proyecto',
          'Describe las funcionalidades necesarias'
        ]
      },
      {
        id: 'projects-page-4',
        title: 'Volver a la Lista',
        description: 'Regresemos a la lista de proyectos para continuar explorando.',
        target: '.back-button',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Volver a la lista de proyectos',
        navigateTo: '/proyectos',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: true
      },
      {
        id: 'projects-page-5',
        title: 'Filtros y Búsqueda',
        description: 'Aprende a usar los filtros y la búsqueda para encontrar proyectos específicos.',
        target: '.projects-filters',
        position: 'bottom',
        action: 'wait',
        actionText: 'Explora las opciones de filtrado',
        skipable: true,
        tips: [
          'Filtra por estado del proyecto',
          'Busca por nombre o descripción',
          'Ordena por fecha o prioridad'
        ]
      }
    ]
  },
  {
    id: 'profile-page-tour',
    name: 'Tour del Perfil de Usuario',
    description: 'Aprende a configurar y personalizar tu perfil',
    icon: '👤',
    category: 'feature',
    estimatedTime: 8,
    difficulty: 'beginner',
    steps: [
      {
        id: 'profile-page-1',
        title: 'Información Personal',
        description: 'En esta sección puedes ver y editar tu información personal.',
        target: '.profile-info',
        position: 'right',
        action: 'wait',
        actionText: 'Observa tu información actual',
        skipable: true,
        tips: [
          'Mantén tu información actualizada',
          'Puedes cambiar tu avatar',
          'La información se sincroniza automáticamente'
        ]
      },
      {
        id: 'profile-page-2',
        title: 'Configuración de Notificaciones',
        description: 'Personaliza cómo y cuándo recibir notificaciones.',
        target: '.notification-settings',
        position: 'left',
        action: 'wait',
        actionText: 'Explora las opciones de notificación',
        skipable: true,
        tips: [
          'Configura qué notificaciones recibir',
          'Establece horarios de silencio',
          'Elige el canal de notificación preferido'
        ]
      },
      {
        id: 'profile-page-3',
        title: 'Preferencias de la Aplicación',
        description: 'Personaliza tu experiencia en la aplicación.',
        target: '.app-preferences',
        position: 'bottom',
        action: 'wait',
        actionText: 'Configura tus preferencias',
        skipable: true,
        tips: [
          'Cambia el tema de la aplicación',
          'Selecciona tu idioma preferido',
          'Ajusta la configuración de privacidad'
        ]
      }
    ]
  },
  {
    id: 'analytics-page-tour',
    name: 'Tour de Analytics',
    description: 'Aprende a usar las herramientas de análisis y reportes',
    icon: '📊',
    category: 'advanced',
    estimatedTime: 12,
    difficulty: 'intermediate',
    steps: [
      {
        id: 'analytics-page-1',
        title: 'Dashboard de Métricas',
        description: 'Aquí puedes ver todas las métricas importantes de tus proyectos.',
        target: '.metrics-dashboard',
        position: 'bottom',
        action: 'wait',
        actionText: 'Explora las métricas disponibles',
        skipable: true,
        tips: [
          'Las métricas se actualizan en tiempo real',
          'Puedes personalizar qué métricas ver',
          'Haz clic en las métricas para ver detalles'
        ]
      },
      {
        id: 'analytics-page-2',
        title: 'Gráficos Interactivos',
        description: 'Los gráficos te permiten visualizar tendencias y patrones.',
        target: '.analytics-charts',
        position: 'right',
        action: 'wait',
        actionText: 'Interactúa con los gráficos',
        skipable: true,
        tips: [
          'Haz clic y arrastra para hacer zoom',
          'Pasa el mouse para ver valores específicos',
          'Usa los controles para cambiar el período'
        ]
      },
      {
        id: 'analytics-page-3',
        title: 'Exportar Reportes',
        description: 'Aprende a exportar tus datos y generar reportes.',
        target: '.export-options',
        position: 'left',
        action: 'wait',
        actionText: 'Explora las opciones de exportación',
        skipable: true,
        tips: [
          'Exporta en diferentes formatos',
          'Programa reportes automáticos',
          'Comparte reportes con tu equipo'
        ]
      }
    ]
  },
  
  // =====================================================
  // TUTORIALES ESPECÍFICOS PARA CLIENTES
  // =====================================================
  
  {
    id: 'client-welcome-tour',
    name: 'Tour de Bienvenida Cliente',
    description: 'Conoce las funcionalidades principales del dashboard para clientes',
    icon: '🎯',
    category: 'onboarding',
    estimatedTime: 8,
    difficulty: 'beginner',
    completionReward: 'Bienvenido a Pulse by TuWebAI',
    steps: [
      {
        id: 'client-welcome-1',
        title: 'Bienvenido a Pulse by TuWebAI',
        description: 'Te guiaremos por las funcionalidades principales del dashboard para que puedas aprovechar al máximo la plataforma y seguir el progreso de tus proyectos.',
        target: '.dashboard-header',
        position: 'bottom',
        action: 'wait',
        actionText: 'Continúa para comenzar',
        skipable: false,
        required: true
      },
      {
        id: 'client-welcome-2',
        title: 'Panel de Tus Proyectos',
        description: 'Aquí puedes ver todos tus proyectos web, su estado actual y el progreso de cada uno. Tu equipo actualiza constantemente esta información.',
        target: '.projects-section',
        position: 'right',
        action: 'hover',
        actionText: 'Pasa el mouse sobre un proyecto',
        skipable: true,
        tips: [
          'Los proyectos se organizan por estado de desarrollo',
          'Puedes ver el progreso en tiempo real',
          'Cada proyecto muestra las próximas entregas'
        ]
      },
      {
        id: 'client-welcome-3',
        title: 'Explorar la Sección de Proyectos',
        description: 'Ahora vamos a navegar a la sección de proyectos para ver todos los detalles de tus proyectos web.',
        target: '.main-navigation',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Navegar a la sección de proyectos',
        navigateTo: '/proyectos',
        waitForNavigation: false,
        navigationDelay: 0,
        skipable: true,
        autoNavigate: true,
        tips: [
          'La sección de proyectos es donde ves todo el detalle',
          'Puedes ver el progreso de cada fase',
          'Comunícate directamente con tu equipo de desarrollo'
        ]
      },
      {
        id: 'client-welcome-4',
        title: 'Gestión de Tus Proyectos',
        description: 'En esta página puedes ver todos tus proyectos web, su estado actual y comunicarte con tu equipo. Observa las diferentes opciones disponibles.',
        target: '.projects-grid',
        position: 'right',
        action: 'wait',
        actionText: 'Observa las opciones disponibles',
        skipable: true,
        tips: [
          'Cada proyecto muestra su estado actual',
          'Puedes ver las entregas programadas',
          'Comunícate con tu equipo en cada proyecto'
        ]
      },
      {
        id: 'client-welcome-5',
        title: 'Explorar tu Perfil',
        description: 'Ahora vamos a ver tu perfil personal donde puedes configurar tu información y preferencias de comunicación.',
        target: '.user-profile',
        position: 'left',
        action: 'navigate',
        actionText: 'Navegar a tu perfil',
        navigateTo: '/perfil',
        waitForNavigation: false,
        navigationDelay: 0,
        skipable: true,
        tips: [
          'Puedes cambiar tu avatar y información personal',
          'Configura cómo quieres recibir las notificaciones',
          'Personaliza tu experiencia de usuario'
        ]
      },
      {
        id: 'client-welcome-6',
        title: 'Configuración Personal',
        description: 'En tu perfil puedes personalizar tu experiencia, cambiar tu avatar, y configurar las notificaciones según tus preferencias.',
        target: '.profile-settings',
        position: 'right',
        action: 'wait',
        actionText: 'Explora las opciones de configuración',
        skipable: true,
        tips: [
          'Mantén tu información actualizada',
          'Configura las notificaciones que necesites',
          'Personaliza tu experiencia de usuario'
        ]
      },
      {
        id: 'client-welcome-7',
        title: 'Volver al Dashboard',
        description: 'Ahora regresemos al dashboard principal para completar el tour.',
        target: '.dashboard-link',
        position: 'bottom',
        action: 'navigate',
        actionText: 'Volver al dashboard',
        navigateTo: '/dashboard',
        waitForNavigation: false,
        navigationDelay: 0,
        skipable: true
      },
      {
        id: 'client-welcome-8',
        title: '¡Listo para comenzar!',
        description: 'Ya conoces lo básico del dashboard. Puedes acceder a más tutoriales desde el menú de ayuda en cualquier momento.',
        target: '.help-button',
        position: 'top',
        action: 'click',
        actionText: 'Accede a la ayuda',
        skipable: false,
        required: true,
        tips: [
          'El botón de ayuda está siempre disponible',
          'Puedes buscar artículos específicos',
          'Los tutoriales se adaptan a tu nivel de experiencia'
        ]
      }
    ]
  },
  
  {
    id: 'client-projects-tour',
    name: 'Gestiona tus Proyectos',
    description: 'Aprende a gestionar y seguir tus proyectos web',
    icon: '📁',
    estimatedTime: 6,
    difficulty: 'beginner',
    category: 'feature',
    steps: [
      {
        id: 'client-projects-1',
        title: 'Vista General de Proyectos',
        description: 'Aquí puedes ver todos tus proyectos con su estado actual y progreso.',
        target: '.projects-list',
        position: 'center',
        action: 'navigate',
        actionText: 'Navegar a proyectos',
        navigateTo: '/proyectos',
        waitForNavigation: true,
        navigationDelay: 1000,
        skipable: false,
        tips: [
          'Cada proyecto muestra su estado actual',
          'El progreso se actualiza en tiempo real',
          'Puedes filtrar y buscar proyectos'
        ]
      },
      {
        id: 'client-projects-2',
        title: 'Detalles del Proyecto',
        description: 'Haz clic en cualquier proyecto para ver detalles completos y comunicarte con tu equipo.',
        target: '.project-card',
        position: 'right',
        action: 'click',
        actionText: 'Haz clic en un proyecto',
        skipable: true,
        tips: [
          'Ve todas las fases del proyecto',
          'Revisa comentarios y actualizaciones',
          'Comunícate directamente con tu equipo'
        ]
      },
      {
        id: 'client-projects-3',
        title: 'Colaboración en Tiempo Real',
        description: 'Utiliza el sistema de comentarios para comunicarte con tu equipo de desarrollo.',
        target: '.collaboration-section',
        position: 'left',
        action: 'wait',
        actionText: 'Explora la colaboración',
        skipable: true,
        tips: [
          'Añade comentarios en cada fase',
          'Recibe notificaciones de actualizaciones',
          'Mantén una comunicación fluida'
        ]
      }
    ]
  }
];

// =====================================================
// ARTÍCULOS DE AYUDA PREDEFINIDOS
// =====================================================

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Primeros Pasos en Pulse by TuWebAI',
    content: `
# Primeros Pasos en Pulse by TuWebAI

## Bienvenido a Pulse by TuWebAI

Pulse es una plataforma profesional para la gestion de proyectos web que te permite colaborar con tu equipo en tiempo real.

## Configuración Inicial

### 1. Completar tu Perfil
- Ve a tu perfil y completa la información básica
- Sube una foto de perfil profesional
- Configura tus preferencias de notificación

### 2. Crear tu Primer Proyecto
- Haz clic en "Crear Proyecto"
- Selecciona el tipo de proyecto (Web, App, Landing, Ecommerce)
- Añade una descripción detallada
- Configura las funcionalidades necesarias

### 3. Invitar a tu Equipo
- Accede a la sección de colaboración
- Invita a los miembros de tu equipo
- Configura los permisos apropiados

## Consejos para Empezar

- **Organiza tus proyectos** por fases para un mejor seguimiento
- **Utiliza las notificaciones** para mantenerte informado
- **Explora los tutoriales** para conocer todas las funcionalidades
- **Personaliza tu dashboard** según tus necesidades

## Próximos Pasos

Una vez que hayas completado la configuración inicial, te recomendamos:
1. Completar el tutorial de gestión de proyectos
2. Configurar las automatizaciones básicas
3. Explorar las funcionalidades avanzadas
    `,
    category: 'onboarding',
    tags: ['inicio', 'configuración', 'primeros pasos'],
    lastUpdated: '2024-01-15',
    author: 'Equipo de Pulse by TuWebAI',
    views: 1250,
    helpful: 98,
    notHelpful: 2,
    relatedArticles: ['project-management', 'team-collaboration']
  },
  {
    id: 'project-management',
    title: 'Gestión Efectiva de Proyectos',
    content: `
# Gestión Efectiva de Proyectos

## Organización por Fases

### Fases Estándar
1. **UI Design** - Diseño de interfaz y experiencia de usuario
2. **Maquetado** - Estructuración y maquetado de páginas
3. **Contenido** - Creación y optimización de contenido
4. **Funcionalidades** - Desarrollo de características interactivas
5. **SEO** - Optimización para motores de búsqueda
6. **Deploy** - Despliegue y puesta en producción

### Mejores Prácticas
- **Define objetivos claros** para cada fase
- **Establece fechas límite** realistas
- **Asigna responsables** específicos
- **Documenta el progreso** regularmente

## Gestión de Tareas

### Creación de Tareas
- Título descriptivo y claro
- Descripción detallada de los requisitos
- Asignación de responsable
- Fecha límite específica
- Prioridad (Alta, Media, Baja)

### Seguimiento del Progreso
- Actualiza el estado regularmente
- Añade comentarios y observaciones
- Adjunta archivos relevantes
- Comunica bloqueos o problemas

## Colaboración Efectiva

### Comunicación
- Utiliza el chat para comunicación rápida
- Añade comentarios en las tareas específicas
- Mantén actualizada la información del proyecto
- Comparte archivos y recursos relevantes

### Reuniones y Revisiones
- Programa revisiones regulares
- Documenta las decisiones tomadas
- Actualiza el estado después de cada reunión
- Comparte los resultados con el equipo
    `,
    category: 'project-management',
    tags: ['proyectos', 'fases', 'tareas', 'colaboración'],
    lastUpdated: '2024-01-10',
    author: 'Equipo de Pulse by TuWebAI',
    views: 890,
    helpful: 85,
    notHelpful: 5,
    relatedArticles: ['getting-started', 'team-collaboration', 'time-management']
  },
  {
    id: 'troubleshooting',
    title: 'Solución de Problemas Comunes',
    content: `
# Solución de Problemas Comunes

## Problemas de Acceso

### No puedo iniciar sesión
1. Verifica que tu email esté correcto
2. Revisa tu contraseña
3. Asegúrate de que tu cuenta esté activa
4. Contacta al administrador si persiste el problema

### Problemas de Permisos
- Verifica que tengas los permisos necesarios
- Contacta al administrador del proyecto
- Revisa tu rol en el sistema

## Problemas de Rendimiento

### Carga lenta del dashboard
1. Verifica tu conexión a internet
2. Limpia la caché del navegador
3. Cierra pestañas innecesarias
4. Actualiza tu navegador

### Problemas con archivos
- Verifica el tamaño del archivo (máximo 100MB)
- Asegúrate de que el formato sea compatible
- Revisa tu conexión a internet
- Intenta subir el archivo nuevamente

## Problemas de Notificaciones

### No recibo notificaciones
1. Verifica la configuración de notificaciones
2. Revisa los horarios silenciosos
3. Asegúrate de que las notificaciones estén habilitadas
4. Verifica la configuración del navegador

## Contacto de Soporte

Si no encuentras la solución a tu problema:
- Utiliza el chat de soporte en vivo
- Envía un email a soporte@tuwebai.com
- Consulta la base de conocimientos
- Programa una llamada con nuestro equipo
    `,
    category: 'troubleshooting',
    tags: ['problemas', 'soporte', 'solución', 'ayuda'],
    lastUpdated: '2024-01-12',
    author: 'Equipo de Soporte',
    views: 650,
    helpful: 78,
    notHelpful: 8,
    relatedArticles: ['getting-started', 'notifications-setup']
  }
];

// =====================================================
// PROVIDER
// =====================================================

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useApp();
  
  // Estado del tutorial
  const [isActive, setIsActive] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<TutorialFlow | null>(null);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState<TutorialProgress | null>(null);
  
  // Flujos y progreso - Filtrar por rol del usuario
  const getAvailableFlows = useCallback(() => {
    if (!user) return TUTORIAL_FLOWS; // Mostrar todos si no hay usuario
    
    // Filtrar flujos según el rol del usuario
    return TUTORIAL_FLOWS.filter(flow => {
      if (user.role === 'admin') {
        // El panel admin no expone onboarding ni tutoriales guiados.
        return false;
      } else {
        // Los usuarios normales solo ven flujos específicos para clientes
        return flow.id.includes('client') || 
               flow.id === 'welcome-tour' || 
               flow.id === 'support-help' ||
               flow.id === 'profile-page-tour';
      }
    });
  }, [user]);
  
  const [availableFlows, setAvailableFlows] = useState<TutorialFlow[]>(TUTORIAL_FLOWS);
  const [completedFlows, setCompletedFlows] = useState<string[]>([]);
  
  // Artículos de ayuda
  const [helpArticles] = useState<HelpArticle[]>(HELP_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(HELP_ARTICLES);
  
  // Configuración
  const [autoStart, setAutoStart] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [enableSounds, setEnableSounds] = useState(true);

  // =====================================================
  // EFECTOS
  // =====================================================

  // Actualizar flujos disponibles cuando cambie el usuario
  useEffect(() => {
    const flows = getAvailableFlows();
    setAvailableFlows(flows);
  }, [user, getAvailableFlows]);

  // Auto-iniciar tutorial para nuevos usuarios (solo una vez)
  useEffect(() => {
    if (isAuthenticated && user && autoStart && user.role !== 'admin') {
      // Determinar qué tutorial iniciar según el rol
      const tutorialId = 'client-welcome-tour';
      const storageKey = `tutorial-${tutorialId}-completed`;
      const sessionKey = `tutorial-${tutorialId}-session-${user.id}`;
      
      const hasCompletedWelcome = localStorage.getItem(storageKey);
      const hasStartedThisSession = sessionStorage.getItem(sessionKey);
      
      // Solo iniciar si no se ha completado Y no se ha iniciado en esta sesión
      if (!hasCompletedWelcome && !hasStartedThisSession) {
        sessionStorage.setItem(sessionKey, 'started');
        setTimeout(() => {
          startTutorial(tutorialId);
        }, 2000); // Esperar 2 segundos después del login
      }
    }
  }, [isAuthenticated, user, autoStart]);

  // Filtrar artículos de ayuda
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = helpArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(helpArticles);
    }
  }, [searchQuery, helpArticles]);

  // =====================================================
  // FUNCIONES DEL TUTORIAL
  // =====================================================

  const startTutorial = useCallback((flowId: string) => {

    
    const flow = availableFlows.find(f => f.id === flowId);
    if (!flow) {

      return;
    }


    setCurrentFlow(flow);
    setCurrentStep(flow.steps[0]);
    setStepIndex(0);
    setIsActive(true);
    
    const newProgress: TutorialProgress = {
      flowId,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString(),
      skippedSteps: [],
      timeSpent: 0
    };
    setProgress(newProgress);


    // Reproducir sonido si está habilitado
    if (enableSounds) {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignorar errores de audio
    }
  }, [availableFlows, enableSounds]);

  const nextStep = useCallback(() => {
    if (!currentFlow || !currentStep || !progress) return;

    const newProgress = {
      ...progress,
      completedSteps: [...progress.completedSteps, currentStep.id],
      currentStep: stepIndex + 1,
      timeSpent: progress.timeSpent + 5 // Estimación de 5 segundos por paso
    };
    setProgress(newProgress);

    if (stepIndex < currentFlow.steps.length - 1) {
      const nextStepIndex = stepIndex + 1;
      setStepIndex(nextStepIndex);
      setCurrentStep(currentFlow.steps[nextStepIndex]);
    } else {
      completeTutorial();
    }
  }, [currentFlow, currentStep, progress, stepIndex]);

  const prevStep = useCallback(() => {
    if (!currentFlow || stepIndex <= 0) return;

    const prevStepIndex = stepIndex - 1;
    setStepIndex(prevStepIndex);
    setCurrentStep(currentFlow.steps[prevStepIndex]);
  }, [currentFlow, stepIndex]);

  const skipStep = useCallback(() => {
    if (!currentStep || !progress) return;

    const newProgress = {
      ...progress,
      skippedSteps: [...progress.skippedSteps, currentStep.id],
      currentStep: stepIndex + 1
    };
    setProgress(newProgress);

    nextStep();
  }, [currentStep, progress, stepIndex, nextStep]);

  const completeTutorial = useCallback(() => {
    if (!currentFlow || !progress) return;

    const completedProgress = {
      ...progress,
      completedAt: new Date().toISOString(),
      timeSpent: progress.timeSpent + 10 // Tiempo final
    };

    setCompletedFlows(prev => [...prev, currentFlow.id]);
    localStorage.setItem(`tutorial-${currentFlow.id}-completed`, 'true');
    
    // Reproducir sonido de finalización
    if (enableSounds) {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    exitTutorial();
  }, [currentFlow, progress, enableSounds]);

  const exitTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStep(null);
    setStepIndex(0);
    setProgress(null);
  }, []);

  const navigateToStep = useCallback((stepId: string) => {
    if (!currentFlow) return;
    
    const stepIndex = currentFlow.steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setStepIndex(stepIndex);
      setCurrentStep(currentFlow.steps[stepIndex]);
    }
  }, [currentFlow]);

  // =====================================================
  // FUNCIONES DE AYUDA
  // =====================================================

  const searchHelp = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const markArticleHelpful = useCallback((articleId: string, helpful: boolean) => {
    // En una implementación real, esto se enviaría al servidor

  }, []);

  const getContextualHelp = useCallback((context: string): HelpArticle[] => {
    // Retornar artículos relevantes basados en el contexto
    return helpArticles.filter(article =>
      article.tags.some(tag => 
        context.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(context.toLowerCase())
      )
    );
  }, [helpArticles]);

  // =====================================================
  // VALOR DEL CONTEXTO
  // =====================================================

  const value: TutorialContextType = {
    // Estado del tutorial
    isActive,
    currentFlow,
    currentStep,
    stepIndex,
    progress,
    
    // Flujos y progreso
    availableFlows,
    completedFlows,
    
    // Artículos de ayuda
    helpArticles,
    searchQuery,
    filteredArticles,
    
    // Acciones del tutorial
    startTutorial,
    nextStep,
    prevStep,
    skipStep,
    completeTutorial,
    exitTutorial,
    navigateToStep,
    
    // Acciones de ayuda
    searchHelp,
    markArticleHelpful,
    getContextualHelp,
    
    // Configuración
    autoStart,
    showHints,
    enableSounds,
    setAutoStart,
    setShowHints,
    setEnableSounds
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

// =====================================================
// HOOK PERSONALIZADO
// =====================================================

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
