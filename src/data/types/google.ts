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
  updatedAt: string;
}

export interface GoogleSearchConsoleConnectResponse {
  authorizationUrl: string;
}

