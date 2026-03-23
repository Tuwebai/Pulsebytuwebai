/**
 * Hooks de Notification Analytics - Capa de React Query
 * 
 * Proporciona hooks tipados para obtener analytics de notificaciones
 * utilizando React Query para cache, invalidación y estados.
 * 
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  notificationAnalyticsService,
  AnalyticsSummary,
  ChannelPerformance,
  CategoryPerformance,
  TimeSeriesData,
  NotificationInsights
} from '@/lib/services/notificationAnalyticsService';

// ============================================
// TIPOS
// ============================================

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  channels: string[];
  categories: string[];
  groupBy: 'day' | 'week' | 'month';
}

export interface NotificationAnalyticsData {
  summary: AnalyticsSummary;
  channelPerformance: ChannelPerformance[];
  categoryPerformance: CategoryPerformance[];
  timeSeriesData: TimeSeriesData[];
  insights: NotificationInsights;
}

// ============================================
// QUERY KEYS
// ============================================

const QUERY_KEYS = {
  analyticsSummary: (filters: AnalyticsFilters) => ['notification-analytics', 'summary', filters] as const,
  channelPerformance: (filters: AnalyticsFilters) => ['notification-analytics', 'channels', filters] as const,
  categoryPerformance: (filters: AnalyticsFilters) => ['notification-analytics', 'categories', filters] as const,
  timeSeriesData: (filters: AnalyticsFilters) => ['notification-analytics', 'timeseries', filters] as const,
  insights: (filters: AnalyticsFilters) => ['notification-analytics', 'insights', filters] as const,
  allAnalytics: (filters: AnalyticsFilters) => ['notification-analytics', 'all', filters] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook para obtener el resumen de analytics
 */
export function useAnalyticsSummary(filters: AnalyticsFilters) {
  return useQuery<AnalyticsSummary, Error>({
    queryKey: QUERY_KEYS.analyticsSummary(filters),
    queryFn: () => notificationAnalyticsService.getAnalyticsSummary(
      filters.startDate,
      filters.endDate
    ),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener rendimiento por canal
 */
export function useChannelPerformance(filters: AnalyticsFilters) {
  return useQuery<ChannelPerformance[], Error>({
    queryKey: QUERY_KEYS.channelPerformance(filters),
    queryFn: () => notificationAnalyticsService.getChannelPerformance(
      filters.startDate,
      filters.endDate
    ),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener rendimiento por categoría
 */
export function useCategoryPerformance(filters: AnalyticsFilters) {
  return useQuery<CategoryPerformance[], Error>({
    queryKey: QUERY_KEYS.categoryPerformance(filters),
    queryFn: () => notificationAnalyticsService.getCategoryPerformance(
      filters.startDate,
      filters.endDate
    ),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener datos de series temporales
 */
export function useTimeSeriesData(filters: AnalyticsFilters) {
  return useQuery<TimeSeriesData[], Error>({
    queryKey: QUERY_KEYS.timeSeriesData(filters),
    queryFn: () => notificationAnalyticsService.getTimeSeriesData(
      30,
      filters.channels[0],
      filters.categories[0]
    ),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener insights de notifications
 */
export function useNotificationInsights(filters: AnalyticsFilters) {
  return useQuery<NotificationInsights, Error>({
    queryKey: QUERY_KEYS.insights(filters),
    queryFn: () => notificationAnalyticsService.getNotificationInsights({
      startDate: filters.startDate,
      endDate: filters.endDate
    }),
    staleTime: 10 * 60 * 1000, // 10 minutos para insights
  });
}

/**
 * Hook combinado para obtener todos los datos de analytics
 * Utiliza Promise.all para cargar todos los datos en paralelo
 */
export function useNotificationAnalytics(filters: AnalyticsFilters) {
  const summaryQuery = useAnalyticsSummary(filters);
  const channelsQuery = useChannelPerformance(filters);
  const categoriesQuery = useCategoryPerformance(filters);
  const timeSeriesQuery = useTimeSeriesData(filters);
  const insightsQuery = useNotificationInsights(filters);

  const isLoading = 
    summaryQuery.isLoading || 
    channelsQuery.isLoading || 
    categoriesQuery.isLoading || 
    timeSeriesQuery.isLoading || 
    insightsQuery.isLoading;

  const isError = 
    summaryQuery.isError || 
    channelsQuery.isError || 
    categoriesQuery.isError || 
    timeSeriesQuery.isError || 
    insightsQuery.isError;

  const error = 
    summaryQuery.error || 
    channelsQuery.error || 
    categoriesQuery.error || 
    timeSeriesQuery.error || 
    insightsQuery.error;

  const data: NotificationAnalyticsData | undefined = (summaryQuery.data && channelsQuery.data && categoriesQuery.data && timeSeriesQuery.data && insightsQuery.data)
    ? {
        summary: summaryQuery.data,
        channelPerformance: channelsQuery.data,
        categoryPerformance: categoriesQuery.data,
        timeSeriesData: timeSeriesQuery.data,
        insights: insightsQuery.data
      }
    : undefined;

  const refetch = () => {
    summaryQuery.refetch();
    channelsQuery.refetch();
    categoriesQuery.refetch();
    timeSeriesQuery.refetch();
    insightsQuery.refetch();
  };

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    // Queries individuales por si se necesitan por separado
    summary: summaryQuery,
    channels: channelsQuery,
    categories: categoriesQuery,
    timeSeries: timeSeriesQuery,
    insights: insightsQuery,
  };
}

/**
 * Hook para invalidar caché de analytics
 */
export function useInvalidateNotificationAnalytics() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['notification-analytics'] });
  };
}
