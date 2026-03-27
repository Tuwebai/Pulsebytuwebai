import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  DEFAULT_ADMIN_SECTION,
  getAdminSectionFromRouteSegment,
  isOperationalAdminSectionId,
  type AdminSectionId,
} from '@/features/admin/constants/adminSections';

export function useAdminSectionNavigation() {
  const navigate = useNavigate();
  const { sectionId } = useParams<{ sectionId?: string }>();
  const activeSection = getAdminSectionFromRouteSegment(sectionId);

  useEffect(() => {
    if (sectionId && !isOperationalAdminSectionId(activeSection)) {
      navigate('/admin', { replace: true });
    }
  }, [activeSection, navigate, sectionId]);

  const navigateToSection = useCallback((sectionId: AdminSectionId) => {
    const nextPath = sectionId === DEFAULT_ADMIN_SECTION ? '/admin' : `/admin/${sectionId}`;
    navigate(nextPath);
  }, [navigate]);

  return {
    activeSection,
    navigateToSection,
  };
}
