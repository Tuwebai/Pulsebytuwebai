import { useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  DEFAULT_ADMIN_SECTION,
  getAdminSectionFromRouteSegment,
  isOperationalAdminSectionId,
  type AdminSectionId,
} from '@/features/admin/constants/adminSections';
import type { AdminSectionNavigationOptions } from '@/features/admin/types/adminNavigation';
import {
  getAdminUsersFilterFromSearchParam,
} from '@/features/admin/users/constants/adminUsersFilters';

export function useAdminSectionNavigation() {
  const navigate = useNavigate();
  const { sectionId } = useParams<{ sectionId?: string }>();
  const [searchParams] = useSearchParams();
  const activeSection = getAdminSectionFromRouteSegment(sectionId);
  const activeUsersFilter = getAdminUsersFilterFromSearchParam(searchParams.get('usersFilter'));

  useEffect(() => {
    if (sectionId && !isOperationalAdminSectionId(activeSection)) {
      navigate('/admin', { replace: true });
    }
  }, [activeSection, navigate, sectionId]);

  const navigateToSection = useCallback((sectionId: AdminSectionId, options?: AdminSectionNavigationOptions) => {
    const nextPath = sectionId === DEFAULT_ADMIN_SECTION ? '/admin' : `/admin/${sectionId}`;
    const nextSearchParams = new URLSearchParams();

    if (sectionId === 'usuarios' && options?.usersFilter && options.usersFilter !== 'all') {
      nextSearchParams.set('usersFilter', options.usersFilter);
    }

    const nextSearch = nextSearchParams.toString();
    navigate(nextSearch ? `${nextPath}?${nextSearch}` : nextPath);
  }, [navigate]);

  return {
    activeSection,
    activeUsersFilter,
    navigateToSection,
  };
}
