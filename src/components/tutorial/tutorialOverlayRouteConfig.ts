interface RouteAwareOverlayParams {
  pathname: string;
  screenHeight: number;
  tooltipHeight: number;
  screenWidth: number;
}

const SIDE_PANEL_ROUTES = new Set([
  '/dashboard/perfil',
  '/dashboard/configuracion',
]);

export function getRouteAwareOverlayPosition({
  pathname,
  screenHeight,
  tooltipHeight,
  screenWidth,
}: RouteAwareOverlayParams) {
  if (!SIDE_PANEL_ROUTES.has(pathname)) {
    return null;
  }

  return {
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: `${Math.min(400, screenWidth * 0.35)}px`,
    maxHeight: `${Math.min(tooltipHeight, screenHeight - 40)}px`,
  };
}
