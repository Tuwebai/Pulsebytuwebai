import { ExternalLink, Globe } from 'lucide-react';
import { FadeIn, Skeleton } from '@/core/components';
import type { TopPage } from '@/data/types/pulse';

interface PulseTopPagesCardProps {
  domain: string | null;
  loading: boolean;
  topPages: TopPage[];
}

function getSafeDomain(domain: string | null) {
  if (!domain) {
    return null;
  }

  return domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function getPageUrl(domain: string | null, path: string) {
  const safeDomain = getSafeDomain(domain);

  if (!safeDomain) {
    return path;
  }

  return `https://${safeDomain}${path === '/' ? '' : path}`;
}

function TopPageUrl({ domain, path }: { domain: string | null; path: string }) {
  const pageUrl = getPageUrl(domain, path);

  if (!domain) {
    return <p className="truncate text-slate-100" title={pageUrl}>{pageUrl}</p>;
  }

  return (
    <a
      className="inline-flex max-w-full items-center gap-1 truncate text-slate-100 transition-opacity hover:opacity-80"
      href={pageUrl}
      rel="noreferrer"
      target="_blank"
      title={pageUrl}
    >
      <span className="truncate">{pageUrl}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={1.5} />
    </a>
  );
}

const cellClassName = 'px-4 py-3 sm:px-5';

export default function PulseTopPagesCard({ domain, loading, topPages }: PulseTopPagesCardProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="border-b border-white/10 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
        <h2 className="mt-2 text-sm font-medium text-slate-100">Páginas más visitadas</h2>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className={cellClassName}>Página</th>
              <th className={cellClassName}>Visitas</th>
              <th className={cellClassName}>% del total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-white/10 last:border-b-0">
                  <td className={`${cellClassName} text-sm`} colSpan={3}>
                    <div className="grid grid-cols-[minmax(0,1fr)_96px_96px] items-center gap-4">
                      <Skeleton height="16px" rounded="sm" width="100%" />
                      <Skeleton height="16px" rounded="sm" width="64px" />
                      <Skeleton height="16px" rounded="sm" width="72px" />
                    </div>
                  </td>
                </tr>
              ))
            ) : topPages.length ? (
              topPages.map((page, index) => (
                <tr key={page.path} className={index === topPages.length - 1 ? '' : 'border-b border-white/10'}>
                  <td className={`${cellClassName} text-sm text-slate-300`}>
                    <FadeIn>
                      <div className="min-w-0">
                        <TopPageUrl domain={domain} path={page.path} />
                      </div>
                    </FadeIn>
                  </td>
                  <td className={`${cellClassName} font-data text-sm text-slate-50`}>
                    <FadeIn>{page.visits}</FadeIn>
                  </td>
                  <td className={`${cellClassName} font-data text-sm text-slate-50`}>
                    <FadeIn>{page.percentage}%</FadeIn>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 sm:px-5" colSpan={3}>
                  <FadeIn>
                    <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-slate-500">
                        <Globe className="h-8 w-8" strokeWidth={1.5} />
                      </div>
                      <p className="mt-4 text-[14px] font-medium text-slate-100">
                        Acá vas a ver qué páginas miran más tus clientes
                      </p>
                      <p className="mt-1 text-[13px] text-slate-400">
                        Cuando tu web empiece a recibir visitas, Pulse te va a mostrar cuáles son las secciones más consultadas.
                      </p>
                    </div>
                  </FadeIn>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
