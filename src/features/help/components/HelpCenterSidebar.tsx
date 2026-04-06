import type { Dispatch, SetStateAction } from 'react';

import { AnimatePresence, motion } from '@/core/components/OptimizedMotion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs';
import { PlayCircle, Search } from 'lucide-react';
import type { TutorialFlow } from '@/features/help/types/helpFlow.types';

import { cn } from '@/core/utils/cn';

import { HelpCenterSearchPanel } from './HelpCenterSearchPanel';
import { HelpCenterSidebarHeader } from './HelpCenterSidebarHeader';
import { HelpCenterTutorialList } from './HelpCenterTutorialList';

interface HelpCenterSidebarProps {
  activeTab: string;
  completedFlows: string[];
  filteredTutorials: TutorialFlow[];
  isMobile: boolean;
  isTablet: boolean;
  onActiveTabChange: (value: string) => void;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSearchChange: (query: string) => void;
  onSelectedCategoryChange: (category: string) => void;
  onStartTutorial: (flowId: string) => void;
  searchInput: string;
  selectedCategory: string;
  setShowSidebar: Dispatch<SetStateAction<boolean>>;
  showSidebar: boolean;
}

export function HelpCenterSidebar({
  activeTab,
  completedFlows,
  filteredTutorials,
  isMobile,
  isTablet,
  onActiveTabChange,
  onClose,
  onNavigate,
  onSearchChange,
  onSelectedCategoryChange,
  onStartTutorial,
  searchInput,
  selectedCategory,
  setShowSidebar,
  showSidebar,
}: HelpCenterSidebarProps) {
  return (
    <AnimatePresence>
      {showSidebar || !isMobile ? (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.25 }}
          className={cn(
            'flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]/98',
            isMobile ? 'h-[46vh] w-full border-b border-r-0' : 'w-[320px]',
            isTablet ? 'w-[290px]' : '',
          )}
        >
          <HelpCenterSidebarHeader
            isMobile={isMobile}
            onHideSidebar={() => setShowSidebar(false)}
          />

          <div className={cn('flex-1 overflow-y-auto', isMobile ? 'p-3' : 'p-4')}>
            <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1">
                <TabsTrigger
                  value="search"
                  className="rounded-full text-[13px] text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)]"
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Buscar
                </TabsTrigger>
                <TabsTrigger
                  value="tutorials"
                  className="rounded-full text-[13px] text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)]"
                >
                  <PlayCircle className="mr-1.5 h-4 w-4" />
                  Tutoriales
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-4">
                <HelpCenterSearchPanel
                  isMobile={isMobile}
                  onActiveTabChange={onActiveTabChange}
                  onClose={onClose}
                  onNavigate={onNavigate}
                  onSearchChange={onSearchChange}
                  onSelectedCategoryChange={onSelectedCategoryChange}
                  onStartTutorial={onStartTutorial}
                  searchInput={searchInput}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>

              <TabsContent value="tutorials" className="mt-4">
                <HelpCenterTutorialList
                  completedFlows={completedFlows}
                  flows={filteredTutorials}
                  onClose={onClose}
                  onStartTutorial={onStartTutorial}
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
