export type GoogleSearchConsoleConnectionStatus =
  | 'pending'
  | 'connected'
  | 'property_not_found'
  | 'reauthorization_required'
  | 'error';

export interface GoogleSearchConsoleConnection {
  id: string;
  projectId: string;
  siteUrl: string | null;
  propertyType: 'domain' | 'url_prefix' | null;
  permissionLevel: string | null;
  googleAccountEmail: string | null;
  connectionStatus: GoogleSearchConsoleConnectionStatus;
  connectedAt: string | null;
  lastValidatedAt: string | null;
  lastSyncError?: string | null;
  lastSyncStatus?: 'idle' | 'success' | 'error' | null;
  updatedAt: string;
}

export interface GoogleSearchConsoleConnectResponse {
  authorizationUrl: string;
}

export interface GoogleSearchConsoleMetricRow {
  clicks: number;
  ctr: number;
  date: string;
  id: string;
  impressions: number;
  position: number;
  projectId: string;
  propertyId: string;
  updatedAt: string | null;
}

export interface GoogleSearchConsoleDimensionRow {
  clicks: number;
  ctr: number;
  dimensionKey: string;
  dimensionType: 'page' | 'query';
  id: string;
  impressions: number;
  metricWindowFrom: string;
  metricWindowTo: string;
  position: number;
  projectId: string;
  propertyId: string;
  updatedAt: string | null;
}

export interface GoogleSearchConsoleChartPoint {
  clicks: number;
  date: string;
  impressions: number;
}

export interface GoogleSearchConsoleOverview {
  clicks: number;
  clicksDelta: number | null;
  ctr: number | null;
  ctrDelta: number | null;
  dateRange: {
    from: string;
    to: string;
  };
  hasData: boolean;
  impressions: number;
  impressionsDelta: number | null;
  lastSyncError: string | null;
  lastSyncLabel: string;
  lastUpdatedAt: string | null;
  position: number | null;
  positionDelta: number | null;
  topPages: GoogleSearchConsoleDimensionRow[];
  topQueries: GoogleSearchConsoleDimensionRow[];
  chartData: GoogleSearchConsoleChartPoint[];
}
