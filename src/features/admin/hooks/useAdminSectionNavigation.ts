import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_ADMIN_SECTION,
  getAdminSectionFromHash,
  isOperationalAdminSectionId,
  type AdminSectionId,
} from '@/features/admin/constants/adminSections';

export function useAdminSectionNavigation() {
  const [activeSection, setActiveSection] = useState<AdminSectionId>(DEFAULT_ADMIN_SECTION);

  useEffect(() => {
    const syncSectionFromHash = () => {
      const nextSection = getAdminSectionFromHash(window.location.hash);
      setActiveSection(
        isOperationalAdminSectionId(nextSection) ? nextSection : DEFAULT_ADMIN_SECTION,
      );
    };

    syncSectionFromHash();
    window.addEventListener('hashchange', syncSectionFromHash);

    return () => {
      window.removeEventListener('hashchange', syncSectionFromHash);
    };
  }, []);

  const navigateToSection = useCallback((sectionId: AdminSectionId) => {
    const nextHash = `#${sectionId}`;

    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }

    setActiveSection(sectionId);
  }, []);

  return {
    activeSection,
    navigateToSection,
  };
}
